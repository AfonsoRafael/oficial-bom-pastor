import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCatequizandoDto, UpdateCatequizandoDto } from './dto/aluno.dto';
import { UpdateCatequizandoDocumentoDto } from './dto/aluno-documento.dto';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@Injectable()
export class CatequizandosService {
  constructor(private prisma: PrismaService) {}

  async findAll(turmaId?: string, responsavelId?: string, userId?: string, userRole?: UserRole, limit: number = 20, offset: number = 0, semTurma?: boolean) {
    let where: any = {};

    if (semTurma) {
      where.turmaId = null;
    } else if (turmaId) {
      where.turmaId = turmaId;
    }

    if (responsavelId === 'me' && userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (responsavel) {
        where.responsavelId = responsavel.id;
      }
    } else if (responsavelId && responsavelId !== 'me') {
      where.responsavelId = responsavelId;
    }

    const [catequizandos, total] = await Promise.all([
      this.prisma.catequizando.findMany({
        where,
        include: {
          turma: true,
          responsavel: true,
          documentos: true,
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.catequizando.count({ where }),
    ]);

    return { total, catequizandos };
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const catequizando = await this.prisma.catequizando.findUnique({
      where: { id },
      include: {
        turma: true,
        responsavel: true,
        documentos: true,
        inscricoes: {
          include: {
            turma: true,
          },
        },
      },
    });

    if (!catequizando) {
      throw new NotFoundException('Catequizando not found');
    }

    // RESPONSAVEL só pode ver próprios catequizandos
    if (userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (!responsavel || catequizando.responsavelId !== responsavel.id) {
        throw new ForbiddenException('You can only view your own children');
      }
    }

    return catequizando;
  }

  async create(dto: CreateCatequizandoDto, userId?: string, userRole?: UserRole) {
    // RESPONSAVEL só pode criar catequizandos para si mesmo
    if (userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (!responsavel || dto.responsavelId !== responsavel.id) {
        throw new ForbiddenException('You can only create children for yourself');
      }
    }

    const catequizando = await this.prisma.catequizando.create({
      data: {
        nome: dto.nome,
        dataNascimento: new Date(dto.dataNascimento),
        dataBatismo: dto.dataBatismo ? new Date(dto.dataBatismo) : undefined,
        cpf: dto.cpf,
        email: dto.email,
        telefone: dto.telefone,
        endereco: dto.endereco,
        turmaId: dto.turmaId,
        responsavelId: dto.responsavelId,
        observacoes: dto.observacoes,
      },
      include: {
        turma: true,
        responsavel: true,
        documentos: true,
      },
    });

    return catequizando;
  }

  async update(id: string, dto: UpdateCatequizandoDto, userId?: string, userRole?: UserRole) {
    const catequizando = await this.prisma.catequizando.findUnique({ where: { id } });

    if (!catequizando) {
      throw new NotFoundException('Catequizando not found');
    }

    // RESPONSAVEL só pode atualizar próprios catequizandos
    if (userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (!responsavel || catequizando.responsavelId !== responsavel.id) {
        throw new ForbiddenException('You can only update your own children');
      }
    }

    const updated = await this.prisma.catequizando.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.dataNascimento && { dataNascimento: new Date(dto.dataNascimento) }),
        ...(dto.dataBatismo && { dataBatismo: new Date(dto.dataBatismo) }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.endereco !== undefined && { endereco: dto.endereco }),
        ...(dto.turmaId !== undefined && { turmaId: dto.turmaId }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
      },
      include: {
        turma: true,
        responsavel: true,
        documentos: true,
      },
    });

    return updated;
  }

  async updateTurma(id: string, turmaId: string | null, userId?: string, userRole?: UserRole) {
    const catequizando = await this.prisma.catequizando.findUnique({ where: { id } });

    if (!catequizando) {
      throw new NotFoundException('Catequizando not found');
    }

    // RESPONSAVEL só pode atualizar próprios catequizandos
    if (userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (!responsavel || catequizando.responsavelId !== responsavel.id) {
        throw new ForbiddenException('You can only update your own children');
      }
    }

    const updated = await this.prisma.catequizando.update({
      where: { id },
      data: {
        turmaId,
      },
      include: {
        turma: true,
        responsavel: true,
        documentos: true,
      },
    });

    return updated;
  }

  async upsertDocumento(id: string, dto: UpdateCatequizandoDocumentoDto, userId?: string, userRole?: UserRole) {
    const catequizando = await this.prisma.catequizando.findUnique({
      where: { id },
      include: { responsavel: true },
    });

    if (!catequizando) {
      throw new NotFoundException('Catequizando not found');
    }

    if (userRole === USER_ROLES.RESPONSAVEL) {
      const responsavel = await this.prisma.responsavel.findUnique({
        where: { id: userId },
      });

      if (!responsavel || catequizando.responsavelId !== responsavel.id) {
        throw new ForbiddenException('You can only update your own children');
      }
    }

    const uploadDate = dto.uploadDate ? new Date(dto.uploadDate) : undefined;

    const documento = await this.prisma.catequizandoDocumento.upsert({
      where: {
        catequizandoId_tipo: {
          catequizandoId: id,
          tipo: dto.tipo,
        },
      },
      update: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.uploadDate !== undefined && { uploadDate }),
        ...(dto.fileUrl !== undefined && { fileUrl: dto.fileUrl }),
      },
      create: {
        catequizandoId: id,
        tipo: dto.tipo,
        status: dto.status ?? false,
        uploadDate,
        fileUrl: dto.fileUrl,
      },
    });

    return documento;
  }

  async remove(id: string, userId?: string, userRole?: UserRole) {
    const catequizando = await this.prisma.catequizando.findUnique({ where: { id } });

    if (!catequizando) {
      throw new NotFoundException('Catequizando not found');
    }

    // Apenas ADMIN pode deletar
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can delete catequizandos');
    }

    await this.prisma.catequizando.delete({ where: { id } });

    return { message: 'Catequizando deleted successfully' };
  }
}
