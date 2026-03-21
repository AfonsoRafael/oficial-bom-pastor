import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InscricoesService {
  constructor(private prisma: PrismaService) {}

  async findAll(turmaId?: string, status?: string, responsavelId?: string, limit: number = 20, offset: number = 0) {
    const where: any = {};
    if (turmaId) where.turmaId = turmaId;
    if (status) where.status = status;
    if (responsavelId) where.responsavelId = responsavelId;

    const [inscricoes, total] = await Promise.all([
      this.prisma.inscricao.findMany({
        where,
        include: { catequizando: true, turma: true, responsavel: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inscricao.count({ where }),
    ]);

    return { total, inscricoes };
  }

  async findOne(id: string) {
    return this.prisma.inscricao.findUnique({
      where: { id },
      include: { catequizando: true, turma: true, responsavel: true, pagamentos: true },
    });
  }

  async create(data: any) {
    return this.prisma.inscricao.create({
      data,
      include: { catequizando: true, turma: true, responsavel: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.inscricao.update({
      where: { id },
      data,
      include: { catequizando: true, turma: true, responsavel: true },
    });
  }

  async remove(id: string) {
    await this.prisma.inscricao.delete({ where: { id } });
    return { message: 'Inscricao deleted successfully' };
  }
}
