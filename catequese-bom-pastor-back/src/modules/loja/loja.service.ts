import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DestinatarioTipo } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateItemLojaDto, CreateReservaLojaDto } from './dto/loja.dto';

@Injectable()
export class ItensLojaService {
  constructor(private readonly prisma: PrismaService) {}

  async listarReservas(limit: number = 20, offset: number = 0) {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const [reservas, total] = await Promise.all([
      this.prisma.ordemLoja.findMany({
        orderBy: { criadoEm: 'desc' },
        take: safeLimit,
        skip: safeOffset,
        include: {
          itens: true,
        },
      }),
      this.prisma.ordemLoja.count(),
    ]);

    const responsavelIds = [...new Set(reservas.map((reserva) => reserva.responsavelId).filter(Boolean))];
    const responsaveis = await this.prisma.responsavel.findMany({
      where: { id: { in: responsavelIds } },
      select: { id: true, nome: true, email: true, telefone: true },
    });

    const responsaveisPorId = new Map(responsaveis.map((responsavel) => [responsavel.id, responsavel]));

    return {
      total,
      reservas: reservas.map((reserva) => {
        const responsavel = responsaveisPorId.get(reserva.responsavelId);
        const itens = reserva.itens.map((item) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
        }));

        return {
          id: reserva.id,
          status: reserva.status,
          total: reserva.total,
          pagamentoId: reserva.pagamentoId,
          criadoEm: reserva.criadoEm,
          updatedAt: reserva.updatedAt,
          responsavel: responsavel
            ? {
                id: responsavel.id,
                nome: responsavel.nome,
                email: responsavel.email,
                telefone: responsavel.telefone,
              }
            : {
                id: reserva.responsavelId,
                nome: reserva.responsavelId,
                email: '',
                telefone: null,
              },
          itens,
          retiradaAte: new Date(new Date(reserva.criadoEm).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }),
    };
  }

  async reservar(dto: CreateReservaLojaDto, user: { id: string; email: string; role?: string }) {
    if (!dto.itens.length) {
      throw new BadRequestException('Adicione ao menos um item para reservar.');
    }

    const itensAgrupados = new Map<string, number>();

    for (const item of dto.itens) {
      const quantidade = Math.max(1, Math.trunc(item.quantidade || 0));
      itensAgrupados.set(item.itemId, (itensAgrupados.get(item.itemId) || 0) + quantidade);
    }

    const itemIds = [...itensAgrupados.keys()];
    const itensBase = await this.prisma.lojaItem.findMany({
      where: { id: { in: itemIds } },
    });

    if (itensBase.length !== itemIds.length) {
      throw new BadRequestException('Um ou mais itens da reserva não foram encontrados.');
    }

    const itensPorId = new Map(itensBase.map((item) => [item.id, item]));
    const linhas = itemIds.map((itemId) => {
      const item = itensPorId.get(itemId);

      if (!item) {
        throw new BadRequestException('Um ou mais itens da reserva não foram encontrados.');
      }

      const quantidade = itensAgrupados.get(itemId) || 0;

      return {
        item,
        quantidade,
        subtotal: item.preco * quantidade,
      };
    });

    const total = linhas.reduce((acc, linha) => acc + linha.subtotal, 0);
    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: user.id },
      select: { nome: true, email: true },
    });

    const reserva = await this.prisma.ordemLoja.create({
      data: {
        responsavelId: user.id,
        total,
        status: 'reservada',
        itens: {
          connect: itemIds.map((id) => ({ id })),
        },
      },
    });

    const admins = await this.prisma.administrador.findMany({
      select: { id: true },
    });

    const retiradaAte = new Date();
    retiradaAte.setDate(retiradaAte.getDate() + 7);

    if (admins.length > 0) {
      const itensDescricao = linhas
        .map((linha) => `${linha.quantidade}x ${linha.item.nome}`)
        .join(', ');

      await this.prisma.notificacao.createMany({
        data: admins.map((admin) => ({
          usuarioTipo: DestinatarioTipo.ADMINISTRADOR,
          usuarioId: admin.id,
          titulo: 'Nova reserva na lojinha',
          descricao: `${responsavel?.nome || user.email} reservou ${itensDescricao}. Retirada e pagamento na secretaria até ${new Intl.DateTimeFormat('pt-BR').format(retiradaAte)}.`,
          tipo: 'AVISO',
          prioridade: 'ALTA',
          linkRelacionado: '/lojinha',
        })),
      });
    }

    return {
      reserva,
      itens: linhas.map((linha) => ({
        id: linha.item.id,
        nome: linha.item.nome,
        quantidade: linha.quantidade,
        preco: linha.item.preco,
        subtotal: linha.subtotal,
      })),
      total,
      retiradaAte: retiradaAte.toISOString(),
      mensagem: 'Reserva registrada com sucesso. Retire e pague na secretaria em até 7 dias.',
    };
  }

  async create(dto: CreateItemLojaDto) {
    return this.prisma.lojaItem.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        preco: dto.preco,
        estoque: dto.estoque,
        imagemUrl: dto.imagemUrl ?? null,
      },
    });
  }

  async findAll(limit: number = 20, offset: number = 0) {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const [itens, total] = await Promise.all([
      this.prisma.lojaItem.findMany({
        orderBy: { criadoEm: 'desc' }, 
        take: safeLimit,
        skip: safeOffset,
      }),
      this.prisma.lojaItem.count(),
    ]);

    return {
      total,
      itens,
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.lojaItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item com ID "${id}" não foi encontrado.`);
    }

    return item;
  }

  async update(id: string, dto: Partial<CreateItemLojaDto>) {
    await this.findOne(id);

    return this.prisma.lojaItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.lojaItem.delete({
      where: { id },
    });
  }
}