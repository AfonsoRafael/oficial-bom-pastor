import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePreMatriculaDto } from './dto/pre-matricula.dto';
import { MailerService } from '../../common/mailer/mailer.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Injectable()
export class PreMatriculasService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private s3StorageService: S3StorageService,
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

    return { total, preMatriculas };
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

  async create(dto: CreatePreMatriculaDto) {
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
        nomePais: dto.nomePais,
        email: dto.email,
        telefone: dto.telefone,
        sacramentosPais: dto.sacramentosPais,
        CertificadoBatismo: certificadoBatismoUrl,
        ComprovanteEndereco: comprovanteEnderecoUrl,
        CertidaoDeNascimento: certidaoDeNascimentoUrl,
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

    // Aprovação integra a pré-matrícula ao fluxo de catequizandos.
    return this.prisma.$transaction(async (tx) => {
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

      if (preMatricula.status === 'APPROVED') {
        return tx.preMatricula.findUniqueOrThrow({
          where: { id },
          include: {
            decisaoPor: true,
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
    const temporaryPassword = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return bcrypt.hash(temporaryPassword, 10);
  }
}
