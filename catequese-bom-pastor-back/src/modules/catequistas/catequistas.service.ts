import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCatequistaDto, CreateCatequistaInscricaoDto, UpdateCatequistaDto } from './dto/catequista.dto';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { MailerService } from '../../common/mailer/mailer.service';

@Injectable()
export class CatequistasService {
  constructor(
    private prisma: PrismaService,
    private s3StorageService: S3StorageService,
    private mailerService: MailerService,
  ) {}

  async findAll() {
    const catequistas = await this.prisma.catequista.findMany({
      orderBy: { criadoEm: 'desc' },
    });

    return { catequistas };
  }

  async findOne(id: string) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    return catequista;
  }

  async create(dto: CreateCatequistaDto) {
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    return this.prisma.catequista.create({
      data: {
        ...dto,
        senha: hashedPassword,
      },
    });
  }

  async createInscricao(dto: CreateCatequistaInscricaoDto) {
    const comprovanteResidenciaUrl = await this.resolveDocumentLocation(
      dto.comprovanteResidenciaBase64,
      'comprovante-residencia',
    );

    const documentoCpfUrl = await this.resolveDocumentLocation(
      dto.documentoCpfBase64,
      'documento-cpf',
    );

    const inscricao = await this.prisma.inscricaoCatequista.create({
      data: {
        nome: dto.nome,
        dataNascimento: new Date(dto.dataNascimento),
        dataBatismo: dto.dataBatismo ? new Date(dto.dataBatismo) : null,
        email: dto.email,
        telefone: dto.telefone,
        casado: dto.casado,
        casadaIgrejaCatolica: dto.casadaIgrejaCatolica,
        sacramentos: dto.sacramentos ?? null,
        alergias: dto.alergias ?? null,
        ComprovanteResidencia: comprovanteResidenciaUrl ?? null,
        DocumentoCpf: documentoCpfUrl ?? null,
        status: 'PENDING',
      },
      include: {
        decisaoPor: true,
      },
    });

    await this.notifyAdmins(inscricao.id, inscricao.nome);

    return inscricao;
  }

  async findAllInscricoes(status?: string, limit: number = 20, offset: number = 0) {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);
    const statusMap = {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    } as const;

    const normalizedStatus = status ? statusMap[status.toUpperCase() as keyof typeof statusMap] : undefined;
    const where = normalizedStatus ? { status: normalizedStatus } : undefined;

    const [inscricoes, total] = await Promise.all([
      this.prisma.inscricaoCatequista.findMany({
        where,
        include: {
          decisaoPor: true,
        },
        orderBy: { criadoEm: 'desc' },
        take: safeLimit,
        skip: safeOffset,
      }),
      this.prisma.inscricaoCatequista.count({ where }),
    ]);

    return {
      total,
      inscricoes,
    };
  }

  async findOneInscricao(id: string) {
    const inscricao = await this.prisma.inscricaoCatequista.findUnique({
      where: { id },
      include: {
        decisaoPor: true,
      },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao de catequista not found');
    }

    return inscricao;
  }

  async approveInscricao(
    id: string,
    adminId: string,
    observacoesAdmin?: string,
    turmaId?: string,
    categoriaTurma?: 'catequista' | 'auxiliar',
  ) {
    const inscricao = await this.prisma.inscricaoCatequista.findUnique({
      where: { id },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao de catequista not found');
    }

    if (inscricao.status === 'REJECTED') {
      throw new BadRequestException('Inscricao de catequista already rejected');
    }

    if (inscricao.status === 'APPROVED') {
      return this.prisma.inscricaoCatequista.findUniqueOrThrow({
        where: { id },
        include: {
          decisaoPor: true,
        },
      });
    }

    const [existingAdmin, existingResponsavel, existingCatequista] = await Promise.all([
      this.prisma.administrador.findUnique({ where: { email: inscricao.email } }),
      this.prisma.responsavel.findUnique({ where: { email: inscricao.email } }),
      this.prisma.catequista.findUnique({ where: { email: inscricao.email } }),
    ]);

    if (existingAdmin || existingResponsavel || existingCatequista) {
      throw new ConflictException('Este email ja esta cadastrado em outro perfil');
    }

    const categoriaNormalizada = categoriaTurma?.toLowerCase() === 'auxiliar' ? 'AUXILIAR' : 'CATEQUISTA';

    const turmaSelecionada = turmaId
      ? await this.prisma.turma.findUnique({
          where: { id: turmaId },
          select: {
            id: true,
            nome: true,
          },
        })
      : null;

    if (turmaId && !turmaSelecionada) {
      throw new NotFoundException('Turma not found');
    }

    let temporaryPassword: string | undefined;

    const approvedInscricao = await this.prisma.$transaction(async (tx) => {
      temporaryPassword = this.generateTemporaryPassword();
      const temporaryPasswordHash = await bcrypt.hash(temporaryPassword, 10);

      let catequista = await tx.catequista.findUnique({ where: { email: inscricao.email } });

      if (!catequista) {
        catequista = await tx.catequista.create({
          data: {
            nome: inscricao.nome,
            email: inscricao.email,
            senha: temporaryPasswordHash,
            telefone: inscricao.telefone,
            primeiroAcesso: false,
          },
        });
      }

      if (turmaId) {
        await tx.turmaCatequista.upsert({
          where: {
            turmaId_catequistaId: {
              turmaId,
              catequistaId: catequista.id,
            },
          },
          create: {
            turmaId,
            catequistaId: catequista.id,
            categoria: categoriaNormalizada,
          },
          update: {
            categoria: categoriaNormalizada,
          },
        });
      }

      return tx.inscricaoCatequista.update({
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

    await this.notifyCandidateDecision(approvedInscricao.email, approvedInscricao.nome, 'APPROVED', temporaryPassword);

    return approvedInscricao;
  }

  async rejectInscricao(id: string, adminId: string, observacoesAdmin?: string) {
    const inscricao = await this.prisma.inscricaoCatequista.findUnique({
      where: { id },
    });

    if (!inscricao) {
      throw new NotFoundException('Inscricao de catequista not found');
    }

    if (inscricao.status === 'REJECTED') {
      return this.prisma.inscricaoCatequista.findUniqueOrThrow({
        where: { id },
        include: {
          decisaoPor: true,
        },
      });
    }

    if (inscricao.status === 'APPROVED') {
      throw new BadRequestException('Inscricao de catequista already approved');
    }

    const rejectedInscricao = await this.prisma.inscricaoCatequista.update({
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

    await this.notifyCandidateDecision(rejectedInscricao.email, rejectedInscricao.nome, 'REJECTED');

    return rejectedInscricao;
  }

  async update(id: string, dto: UpdateCatequistaDto) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    return this.prisma.catequista.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    await this.prisma.catequista.delete({ where: { id } });

    return { message: 'Catequista deleted successfully' };
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

    return this.s3StorageService.uploadBase64Document(value, 'inscricoes-catequistas', documentLabel);
  }

  private extractMimeTypeFromDataUrl(value: string): string {
    const dataUrlMatch = value.match(/^data:([^;]+);base64,/i);

    if (!dataUrlMatch) {
      throw new BadRequestException('Documento invalido. Envie arquivo em formato data URL base64.');
    }

    return String(dataUrlMatch[1] || '').toLowerCase().trim();
  }

  private async notifyAdmins(preMatriculaId: string, nome: string) {
    const admins = await this.prisma.administrador.findMany({
      select: { email: true, nome: true },
    });

    const to = admins.map((admin) => admin.email).filter(Boolean);

    if (!to.length) {
      return;
    }

    await this.mailerService.sendMail({
      to,
      subject: 'Nova inscricao de catequista aguardando aprovacao',
      text: [
        'Nova inscricao de catequista recebida.',
        `ID: ${preMatriculaId}`,
        `Catequista: ${nome}`,
        'Acesse o painel para aprovar ou reprovar.',
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  private async notifyCandidateDecision(
    email: string,
    nome: string,
    status: 'APPROVED' | 'REJECTED',
    temporaryPassword?: string,
  ) {
    const subject =
      status === 'APPROVED'
        ? 'Sua inscricao de catequista foi aprovada'
        : 'Sua inscricao de catequista foi reprovada';

    const text =
      status === 'APPROVED'
        ? [
            'Sua inscricao de catequista foi aprovada.',
            `Nome: ${nome}`,
            `Senha temporaria: ${temporaryPassword || 'definida pela coordenação'}`,
            'Acesse o sistema com seu email e essa senha inicial.',
          ]
        : [
            'Sua inscricao de catequista nao foi aprovada no momento.',
            `Nome: ${nome}`,
            'Caso queira, entre em contato com a coordenação para mais detalhes.',
          ];

    await this.mailerService.sendMail({
      to: [email],
      subject,
      text: text.join('\n'),
    });
  }

  private generateTemporaryPassword() {
    return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
