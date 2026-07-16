import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventoDto, UpdateEventoDto } from './dto/evento.dto';

@Injectable()
export class CronogramaService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicUpcoming(limit: number = 5) {
    const safeLimit = Math.max(1, Math.min(limit, 20));

    const eventos = await this.prisma.evento.findMany({
      where: {
        tipo: 'GERAL',
        data: {
          gte: new Date(),
        },
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        data: 'asc',
      },
      take: safeLimit,
    });

    return {
      total: eventos.length,
      eventos,
    };
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    limit: number = 100,
    offset: number = 0,
    turmaId?: string,
    categoria?: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const safeLimit = Math.max(1, Math.min(limit, 1000));
    const safeOffset = Math.max(0, offset);

    const visibilityWhere = this.getVisibilityWhere(userId, userRole);
    const where: any = {
      ...visibilityWhere,
      ...(turmaId ? { turmaId } : {}),
      ...(categoria ? { categoria } : {}),
    };

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    const [eventos, total] = await Promise.all([
      this.prisma.evento.findMany({
        where,
        include: {
          turma: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { data: 'asc' },
        take: safeLimit,
        skip: safeOffset,
      }),
      this.prisma.evento.count({ where }),
    ]);

    return { total, eventos };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const visibilityWhere = this.getVisibilityWhere(userId, userRole);
    const evento = await this.prisma.evento.findFirst({
      where: {
        id,
        ...visibilityWhere,
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!evento) {
      throw new NotFoundException('Evento not found');
    }

    return evento;
  }

  async create(dto: CreateEventoDto, userId: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can create eventos');
    }

    if (dto.turmaId) {
      const turma = await this.prisma.turma.findUnique({
        where: { id: dto.turmaId },
        select: { id: true },
      });

      if (!turma) {
        throw new NotFoundException('Turma not found');
      }
    }

    return this.prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        data: new Date(dto.data),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        horaInicio: dto.horaInicio ?? null,
        horaFim: dto.horaFim ?? null,
        local: dto.local ?? null,
        categoria: dto.categoria ?? 'ENCONTRO',
        cor: dto.cor ?? null,
        recorrencia: dto.recorrencia ?? null,
        tipo: dto.tipo ?? 'GERAL',
        turmaId: dto.turmaId ?? null,
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateEventoDto, userId: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can update eventos');
    }

    const existing = await this.prisma.evento.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Evento not found');
    }

    if (dto.turmaId) {
      const turma = await this.prisma.turma.findUnique({
        where: { id: dto.turmaId },
        select: { id: true },
      });

      if (!turma) {
        throw new NotFoundException('Turma not found');
      }
    }

    const updateData: any = {};
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descricao !== undefined) updateData.descricao = dto.descricao;
    if (dto.data !== undefined) updateData.data = new Date(dto.data);
    if (dto.dataFim !== undefined) updateData.dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
    if (dto.horaInicio !== undefined) updateData.horaInicio = dto.horaInicio;
    if (dto.horaFim !== undefined) updateData.horaFim = dto.horaFim;
    if (dto.local !== undefined) updateData.local = dto.local;
    if (dto.categoria !== undefined) updateData.categoria = dto.categoria;
    if (dto.cor !== undefined) updateData.cor = dto.cor;
    if (dto.recorrencia !== undefined) updateData.recorrencia = dto.recorrencia;
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.turmaId !== undefined) updateData.turmaId = dto.turmaId;

    return this.prisma.evento.update({
      where: { id },
      data: updateData,
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can delete eventos');
    }

    const existing = await this.prisma.evento.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Evento not found');
    }

    await this.prisma.evento.delete({
      where: { id },
    });

    return { message: 'Evento deleted successfully' };
  }

  private getVisibilityWhere(userId: string, userRole: UserRole) {
    if (userRole === USER_ROLES.ADMINISTRADOR) {
      return {};
    }

    if (userRole === USER_ROLES.CATEQUISTA) {
      return {
        OR: [
          { tipo: 'GERAL' },
          {
            turma: {
              catequistasTurma: {
                some: {
                  catequistaId: userId,
                },
              },
            },
          },
        ],
      };
    }

    return {
      OR: [
        { tipo: 'GERAL' },
        {
          turma: {
            catequizandos: {
              some: {
                responsavelId: userId,
              },
            },
          },
        },
      ],
    };
  }
}