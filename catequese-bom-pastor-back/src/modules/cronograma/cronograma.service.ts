import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventoDto } from './dto/evento.dto';

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

  async findAll(userId: string, userRole: UserRole, limit: number = 100, offset: number = 0, turmaId?: string) {
    const safeLimit = Math.max(1, Math.min(limit, 1000));
    const safeOffset = Math.max(0, offset);

    const visibilityWhere = this.getVisibilityWhere(userId, userRole);
    const where: any = {
      ...visibilityWhere,
      ...(turmaId ? { turmaId } : {}),
    };

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
