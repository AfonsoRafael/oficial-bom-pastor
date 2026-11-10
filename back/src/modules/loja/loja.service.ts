import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DestinatarioTipo } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { CreateItemLojaDto, CreateReservaLojaDto } from './dto/loja.dto';

@Injectable()
export class ItensLojaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly s3StorageService: S3StorageService,
  ) {}

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
          comprovantePagamentoUrl: reserva.comprovantePagamentoUrl,
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

  async reservar(
    dto: CreateReservaLojaDto,
    user: { id: string; email: string; role?: string },
    comprovantePagamento: { buffer: Buffer; mimetype?: string },
  ) {
    if (!dto.itens.length) {
      throw new BadRequestException('Adicione ao menos um item para reservar.');
    }

    const mimeType = (comprovantePagamento.mimetype || '').toLowerCase().trim();
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Formato de comprovante invalido. Envie PDF ou imagem (JPG, PNG, WEBP).');
    }
    if (comprovantePagamento.buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('O comprovante deve ter no maximo 10 MB.');
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
    const comprovante = await this.s3StorageService.uploadBufferDocument(
      comprovantePagamento.buffer,
      mimeType,
      'comprovantes-lojinha',
      'pagamento',
    );
    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: user.id },
      select: { nome: true, email: true },
    });

    const reserva = await this.prisma.ordemLoja.create({
      data: {
        responsavelId: user.id,
        total,
        status: 'aguardando_confirmacao',
        comprovantePagamentoUrl: comprovante.url,
        itens: {
          connect: itemIds.map((id) => ({ id })),
        },
      },
    });

    const admins = await this.prisma.administrador.findMany({
      select: { id: true, email: true },
    });

    const retiradaAte = new Date();
    retiradaAte.setDate(retiradaAte.getDate() + 7);

    const itensDescricao = linhas
      .map((linha) => `${linha.quantidade}x ${linha.item.nome}`)
      .join(', ');

    if (admins.length > 0) {

      await this.prisma.notificacao.createMany({
        data: admins.map((admin) => ({
          usuarioTipo: DestinatarioTipo.ADMINISTRADOR,
          usuarioId: admin.id,
          titulo: 'Nova compra na lojinha',
          descricao: `${responsavel?.nome || user.email} enviou ${itensDescricao} com comprovante PIX. Aguarda confirmacao administrativa.`,
          tipo: 'AVISO',
          prioridade: 'ALTA',
          linkRelacionado: '/lojinha',
        })),
      });
    }

    const adminEmails = admins.map((admin) => admin.email).filter(Boolean);
    if (adminEmails.length > 0) {
      await this.mailerService.sendMail({
        to: adminEmails,
        subject: 'Nova compra da lojinha aguardando confirmacao',
        text: [
          'Uma nova compra da lojinha foi recebida.',
          `Responsavel: ${responsavel?.nome || user.email}`,
          `Itens: ${itensDescricao}`,
          `Total: R$ ${total.toFixed(2)}`,
          'O comprovante PIX esta anexado a este email.',
        ].join('\n'),
        attachments: [{
          filename: `comprovante-${reserva.id}.${mimeType === 'application/pdf' ? 'pdf' : 'jpg'}`,
          content: comprovantePagamento.buffer,
          contentType: mimeType,
        }],
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
      mensagem: 'Compra enviada com sucesso. Aguarde a confirmacao dos administradores para retirar na secretaria.',
    };
  }

  async confirmarReserva(id: string, admin: { id: string }) {
    const reserva = await this.prisma.ordemLoja.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException('Compra da lojinha nao encontrada.');
    }

    if (reserva.status === 'confirmada') {
      return reserva;
    }

    const confirmada = await this.prisma.ordemLoja.update({
      where: { id },
      data: { status: 'confirmada' },
    });

    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: reserva.responsavelId },
      select: { email: true },
    });

    if (responsavel?.email) {
      await this.mailerService.sendMail({
        to: [responsavel.email],
        subject: 'Sua compra da lojinha foi confirmada',
        text: 'O pagamento da sua compra da lojinha foi confirmado. Retire seus itens na secretaria da catequese.',
      });
    }

    await this.prisma.notificacao.create({
      data: {
        usuarioTipo: DestinatarioTipo.RESPONSAVEL,
        usuarioId: reserva.responsavelId,
        titulo: 'Compra da lojinha confirmada',
        descricao: 'Seu pagamento foi confirmado. Retire os itens na secretaria da catequese.',
        tipo: 'SUCESSO',
        prioridade: 'NORMAL',
        linkRelacionado: '/lojinha',
      },
    });

    return { ...confirmada, confirmadoPor: admin.id };
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