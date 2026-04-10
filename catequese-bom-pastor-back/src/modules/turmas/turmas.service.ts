import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTurmaDto, UpdateTurmaDto } from './dto/turma.dto';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@Injectable()
export class TurmasService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit: number = 20, offset: number = 0) {
    const where: any = {};

    const [turmas, total] = await Promise.all([
      this.prisma.turma.findMany({
        where,
        include: {
          catequistasTurma: {
            include: {
              catequista: true,
            },
          },
          catequizandos: {
            include: {
              responsavel: true,
              documentos: true,
            },
          },
          _count: {
            select: {
              catequizandos: true,
              inscricoes: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.turma.count({ where }),
    ]);

    return { total, turmas };
  }

  async findOne(id: string) {
    const turma = await this.prisma.turma.findUnique({
      where: { id },
      include: {
        catequistasTurma: {
          include: {
            catequista: true,
          },
        },
        catequizandos: {
          include: {
            responsavel: true,
            documentos: true,
          },
        },
        _count: {
          select: {
            inscricoes: true,
            eventos: true,
            materiais: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma not found');
    }

    return turma;
  }

  async create(dto: CreateTurmaDto, createdById: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can create turmas');
    }

    const turma = await this.prisma.turma.create({
      data: {
        nome: dto.nome,
        ano: dto.ano,
        horario: dto.horario,
        sala: dto.sala,
        administradorId: createdById,
      },
    });

    return turma;
  }

  async update(id: string, dto: UpdateTurmaDto, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can update turmas');
    }

    const turma = await this.prisma.turma.findUnique({ where: { id } });

    if (!turma) {
      throw new NotFoundException('Turma not found');
    }

    const updated = await this.prisma.turma.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.ano && { ano: dto.ano }),
        ...(dto.horario !== undefined && { horario: dto.horario }),
        ...(dto.sala !== undefined && { sala: dto.sala }),
      },
    });

    return updated;
  }

  async remove(id: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can delete turmas');
    }

    const turma = await this.prisma.turma.findUnique({ where: { id } });

    if (!turma) {
      throw new NotFoundException('Turma not found');
    }

    await this.prisma.turma.delete({ where: { id } });

    return { message: 'Turma deleted successfully' };
  }

  async getCatequizandos(id: string) {
    const turma = await this.prisma.turma.findUnique({
      where: { id },
      include: {
        catequizandos: {
          include: {
            responsavel: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException('Turma not found');
    }

    return turma.catequizandos;
  }
}
