import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  async findAll(turmaId?: string, status?: string, responsavelId?: string, limit: number = 20, offset: number = 0) {
    const where: any = {};
    if (status) where.status = status;
    if (responsavelId) where.responsavelId = responsavelId;
    if (turmaId) where.inscricao = { turmaId };

    const [pagamentos, total] = await Promise.all([
      this.prisma.pagamento.findMany({
        where,
        include: { inscricao: { include: { turma: true, catequizando: true } }, responsavel: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pagamento.count({ where }),
    ]);

    return { total, pagamentos };
  }

  async findOne(id: string) {
    return this.prisma.pagamento.findUnique({
      where: { id },
      include: { inscricao: { include: { turma: true, catequizando: true } }, responsavel: true },
    });
  }

  async create(data: any) {
    return this.prisma.pagamento.create({
      data,
      include: { inscricao: true, responsavel: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.pagamento.update({
      where: { id },
      data,
      include: { inscricao: true, responsavel: true },
    });
  }

  async remove(id: string) {
    await this.prisma.pagamento.delete({ where: { id } });
    return { message: 'Pagamento deleted successfully' };
  }

  async getRelatorioResumo(dataInicio?: Date, dataFim?: Date, turmaId?: string) {
    const where: any = {};
    if (dataInicio && dataFim) {
      where.dataPagamento = { gte: dataInicio, lte: dataFim };
    }

    const pagamentos = await this.prisma.pagamento.findMany({
      where,
      include: { inscricao: { include: { turma: true } } },
    });

    const total = pagamentos.reduce((acc, p) => acc + p.valor, 0);

    const porMetodo = pagamentos.reduce((acc, p) => {
      acc[p.metodo] = (acc[p.metodo] || 0) + p.valor;
      return acc;
    }, {} as Record<string, number>);

    const porStatus = pagamentos.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + p.valor;
      return acc;
    }, {} as Record<string, number>);

    return { total, porMetodo, porStatus, count: pagamentos.length };
  }
}
