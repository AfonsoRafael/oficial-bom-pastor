import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@Injectable()
export class ResponsaveisService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit: number = 20, offset: number = 0) {
    const [responsaveis, total] = await Promise.all([
      this.prisma.responsavel.findMany({
        include: {
          _count: {
            select: {
              catequizandos: true,
              inscricoes: true,
              pagamentos: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.responsavel.count(),
    ]);

    return { total, responsaveis };
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id },
      include: {
        catequizandos: {
          include: {
            turma: true,
          },
        },
        inscricoes: {
          include: {
            turma: true,
            catequizando: true,
          },
        },
        pagamentos: true,
      },
    });

    if (!responsavel) {
      throw new NotFoundException('Responsavel not found');
    }

    // RESPONSAVEL só pode ver próprios dados
    if (userRole === USER_ROLES.RESPONSAVEL && responsavel.id !== userId) {
      throw new ForbiddenException('You can only view your own data');
    }

    return responsavel;
  }

  async remove(id: string, userRole: UserRole) {
    if (userRole !== USER_ROLES.ADMINISTRADOR) {
      throw new ForbiddenException('Only admins can delete responsaveis');
    }

    const responsavel = await this.prisma.responsavel.findUnique({ where: { id } });

    if (!responsavel) {
      throw new NotFoundException('Responsavel not found');
    }

    await this.prisma.responsavel.delete({ where: { id } });

    return { message: 'Responsavel deleted successfully' };
  }
}
