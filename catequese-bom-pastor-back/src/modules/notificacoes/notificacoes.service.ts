import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListNotificacoesQueryDto } from './dto/notificacao.dto';
import { USER_ROLES } from '../../common/constants/user-roles';
import { DestinatarioTipo } from '@prisma/client';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotificacoes(
    userId: string,
    userRole: string,
    query: ListNotificacoesQueryDto,
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;
    const tipo = this.mapRoleToTipo(userRole);

    const where: any = {
      usuarioTipo: tipo,
      usuarioId: userId,
    };

    if (query.apenasNaoLidas === 'true') {
      where.lida = false;
    }

    const [data, total] = await Promise.all([
      this.prisma.notificacao.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notificacao.count({ where }),
    ]);

    return {
      data: data.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        descricao: n.descricao,
        tipo: n.tipo,
        prioridade: n.prioridade,
        lida: n.lida,
        lidaEm: n.lidaEm,
        linkRelacionado: n.linkRelacionado,
        criadoEm: n.criadoEm,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string, userRole: string) {
    const tipo = this.mapRoleToTipo(userRole);

    return this.prisma.notificacao.count({
      where: {
        usuarioTipo: tipo,
        usuarioId: userId,
        lida: false,
      },
    });
  }

  async markAsRead(userId: string, userRole: string, ids: string[]) {
    const tipo = this.mapRoleToTipo(userRole);

    await this.prisma.notificacao.updateMany({
      where: {
        id: { in: ids },
        usuarioTipo: tipo,
        usuarioId: userId,
        lida: false,
      },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string, userRole: string) {
    const tipo = this.mapRoleToTipo(userRole);

    await this.prisma.notificacao.updateMany({
      where: {
        usuarioTipo: tipo,
        usuarioId: userId,
        lida: false,
      },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    return { success: true };
  }

  async deleteNotificacao(userId: string, userRole: string, id: string) {
    const tipo = this.mapRoleToTipo(userRole);

    await this.prisma.notificacao.deleteMany({
      where: {
        id,
        usuarioTipo: tipo,
        usuarioId: userId,
      },
    });

    return { success: true };
  }

  private mapRoleToTipo(role: string): DestinatarioTipo {
    if (role === USER_ROLES.ADMINISTRADOR) return DestinatarioTipo.ADMINISTRADOR;
    if (role === USER_ROLES.CATEQUISTA) return DestinatarioTipo.CATEQUISTA;
    return DestinatarioTipo.RESPONSAVEL;
  }
}