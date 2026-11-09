import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePreMatriculaDto } from './dto/pre-matricula.dto';
import { MailerService } from '../../common/mailer/mailer.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { AuthService } from '../auth/auth.service';
import { PasswordSetupProfile } from '@prisma/client';

@Injectable()
export class PreMatriculasService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private s3StorageService: S3StorageService,
    private authService: AuthService,
  ) {}

  async findAll(status?: string, limit: number = 20, offset: number = 0) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [preMatriculas, total] = await Promise.all([
      this.prisma.preMatricula.findMany({
        where,
        include: {
          decisaoPor: true,
        },
        take: limit,
        skip: offset,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.preMatricula.count({ where }),
    ]);

    const preMatriculasWithAccess = await Promise.all(preMatriculas.map(async (preMatricula) => {
      if (preMatricula.status !== 'APPROVED') return { ...preMatricula, needsPasswordSetup: false };
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { email: preMatricula.email },
        select: { primeiroAcesso: true },
      });
      return { ...preMatricula, needsPasswordSetup: Boolean(responsavel?.primeiroAcesso) };
    }));

    return { total, preMatriculas: preMatriculasWithAccess };
  }

  async findOne(id: string) {
    const preMatricula = await this.prisma.preMatricula.findUnique({
      where: { id },
      include: {
        decisaoPor: true,
      },
    });

    if (!preMatricula) {
      throw new NotFoundException('Pre-matricula not found');
    }

    return preMatricula;
  }

  private normalizeSacramentos(value?: string) {
    const allowed = ['BATISMO', 'EUCARISTIA', 'CRISMA', 'MATRIMONIO'];
    const items = (value ?? '')
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    if (items.some((item) => !allowed.includes(item))) {
      throw new BadRequestException('sacramentos invalidos. Use BATISMO, EUCARISTIA, CRISMA ou MATRIMONIO.');
    }

    return items.length ? [...new Set(items)].join(',') : null;
  }

  async create(dto: CreatePreMatriculaDto) {
    const nomePai = dto.nomePai?.trim() || null;
    const nomeMae = dto.nomeMae?.trim() || null;

    if (!nomePai && !nomeMae) {
      throw new BadRequestException('nomePai: informe o nome do pai ou da mae.');
    }

    const sacramentosPai = nomePai ? this.normalizeSacramentos(dto.sacramentosPai) : null;
    const sacramentosMae = nomeMae ? this.normalizeSacramentos(dto.sacramentosMae) : null;

    const certificadoBatismoUrl = await this.resolveDocumentLocation(
      dto.certificadoBatismoBase64,
      'certificado-batismo',
    );

    const comprovanteEnderecoUrl = await this.resolveDocumentLocation(
      dto.comprovanteEnderecoBase64,
      'comprovante-endereco',
    );

    const certidaoDeNascimentoUrl = await this.resolveDocumentLocation(
      dto.certidaoDeNascimentoBase64,
      'certidao-de-nascimento',
    );

    const preMatricula = await this.prisma.preMatricula.create({
      data: {
        nomeCatequizando: dto.nomeCatequizando,
        alergiasProblemasSaude: dto.alergiasProblemasSaude,
        dataNascimento: new Date(dto.dataNascimento),
        nomePais: [nomeMae, nomePai].filter(Boolean).join(' e '),
        nomePai,
        nomeMae,
        sacramentosPai,
        sacramentosMae,
        email: dto.email,
        telefone: dto.telefone,
        CertificadoBatismo: certificadoBatismoUrl,
        ComprovanteEndereco: comprovanteEnderecoUrl,
        CertidaoDeNascimento: certidaoDeNascimentoUrl,
        status: 'PENDING',
      },
      include: {
        decisaoPor: true,
      },
    });

    await this.notifyAdmins(preMatricula.id, preMatricula.nomeCatequizando);

    return preMatricula;
  }

  async approve(id: string, adminId: string, observacoesAdmin?: string) {
    const preMatricula = await this.prisma.preMatricula.findUnique({
      where: { id },
    });

    if (!preMatricula) {
      throw new NotFoundException('Pre-matricula not found');
    }

    if (preMatricula.status === 'REJECTED') {
      throw new BadRequestException('Pre-matricula already rejected');
    }

    if (preMatricula.status === 'APPROVED') {
      return this.resendPasswordSetupInvite(id);
    }

    const approved = await this.prisma.$transaction(async (tx) => {
      let responsavel = await tx.responsavel.findUnique({
        where: { email: preMatricula.email },
      });

      if (!responsavel) {
        responsavel = await tx.responsavel.create({
          data: {
            email: preMatricula.email,
            nome: preMatricula.nomePais,
            telefone: preMatricula.telefone,
            senha: await this.generateTemporaryPasswordHash(),
            primeiroAcesso: true,
          },
        });
      }

      const existingCatequizando = await tx.catequizando.findFirst({
        where: {
          nome: preMatricula.nomeCatequizando,
          dataNascimento: preMatricula.dataNascimento,
          responsavelId: responsavel.id,
        },
      });

      if (!existingCatequizando) {
        await tx.catequizando.create({
          data: {
            nome: preMatricula.nomeCatequizando,
            dataNascimento: preMatricula.dataNascimento,
            email: preMatricula.email,
            telefone: preMatricula.telefone,
            responsavelId: responsavel.id,
            observacoes: preMatricula.alergiasProblemasSaude,
          },
        });
      }

      return tx.preMatricula.update({
        where: { id },
        data: {
          status: 'APPROVED',
          decisaoEm: new Date(),
          decisaoPorId: adminId,
          observacoesAdmin,
        },
        include: {
          decisaoPor: true,
        },
      });
    });

    const responsavel = await this.prisma.responsavel.findUnique({ where: { email: preMatricula.email } });
    let emailSent = false;
    if (responsavel?.primeiroAcesso) {
      try {
        const result = await this.authService.sendPasswordSetupInvite(
          PasswordSetupProfile.RESPONSAVEL,
          responsavel.id,
          responsavel.email,
          responsavel.nome,
        );
        emailSent = result.emailSent;
      } catch {
        emailSent = false;
      }
    }

    return { ...approved, emailSent };
  }

  async resendPasswordSetupInvite(id: string) {
    const preMatricula = await this.prisma.preMatricula.findUnique({ where: { id } });
    if (!preMatricula) throw new NotFoundException('Pre-matricula not found');
    if (preMatricula.status !== 'APPROVED') throw new BadRequestException('A pré-matrícula precisa estar aprovada para reenviar o convite.');

    const responsavel = await this.prisma.responsavel.findUnique({ where: { email: preMatricula.email } });
    if (!responsavel) throw new NotFoundException('Responsável não encontrado');
    if (!responsavel.primeiroAcesso) {
      throw new BadRequestException('Este responsável já criou a senha e ativou o acesso.');
    }

    return this.authService.sendPasswordSetupInvite(
      PasswordSetupProfile.RESPONSAVEL,
      responsavel.id,
      responsavel.email,
      responsavel.nome,
    );
  }

  async reject(id: string, adminId: string, observacoesAdmin?: string) {
    const preMatricula = await this.prisma.preMatricula.findUnique({
      where: { id },
    });

    if (!preMatricula) {
      throw new NotFoundException('Pre-matricula not found');
    }

    if (preMatricula.status === 'REJECTED') {
      return preMatricula;
    }

    if (preMatricula.status === 'APPROVED') {
      throw new BadRequestException('Pre-matricula already approved');
    }

    return this.prisma.preMatricula.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decisaoEm: new Date(),
        decisaoPorId: adminId,
        observacoesAdmin,
      },
      include: {
        decisaoPor: true,
      },
    });
  }

  private async notifyAdmins(preMatriculaId: string, nome: string) {
    const admins = await this.prisma.administrador.findMany({
      select: { email: true, nome: true },
    });

    const to = admins.map((admin) => admin.email).filter(Boolean);

    if (!to.length) {
      return;
    }

    const subject = 'Nova pre-matricula aguardando aprovacao';
    const text = [
      'Nova pre-matricula recebida.',
      `ID: ${preMatriculaId}`,
      `Catequizando: ${nome}`,
      'Acesse o painel para aprovar ou reprovar.',
    ]
      .filter(Boolean)
      .join('\n');

    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  private async resolveDocumentLocation(value: string | undefined, documentLabel: string) {
    if (!value) {
      return undefined;
    }

    const mimeType = this.extractMimeTypeFromDataUrl(value);
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Formato de documento invalido. Envie PDF ou imagem (JPG, PNG, WEBP).');
    }

    return this.s3StorageService.uploadBase64Document(value, 'pre-matriculas', documentLabel);
  }

  private extractMimeTypeFromDataUrl(value: string): string {
    const dataUrlMatch = value.match(/^data:([^;]+);base64,/i);

    if (!dataUrlMatch) {
      throw new BadRequestException('Documento invalido. Envie arquivo em formato data URL base64.');
    }

    return String(dataUrlMatch[1] || '').toLowerCase().trim();
  }

  private async generateTemporaryPasswordHash() {
    return bcrypt.hash(randomBytes(48).toString('hex'), 12);
  }
}
