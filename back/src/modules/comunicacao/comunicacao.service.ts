import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendMensagemDto, ListMensagensQueryDto } from './dto/comunicacao.dto';
import { USER_ROLES } from '../../common/constants/user-roles';
import { DestinatarioTipo } from '@prisma/client';

interface DestinatarioEntry {
  tipo: DestinatarioTipo;
  id: string;
}

@Injectable()
export class ComunicacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecipients(userId: string, role: string, turmaId?: string) {
    if (role === USER_ROLES.ADMINISTRADOR) {
      return this.getAdminRecipients();
    }
    if (role === USER_ROLES.CATEQUISTA) {
      return this.getCatequistaRecipients(userId);
    }
    if (role === USER_ROLES.RESPONSAVEL) {
      return this.getResponsavelRecipients(userId);
    }
    return [];
  }

  private async getAdminRecipients() {
    const [catequistas, responsaveis, turmas] = await Promise.all([
      this.prisma.catequista.findMany({
        select: { id: true, nome: true, email: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.responsavel.findMany({
        select: { id: true, nome: true, email: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.turma.findMany({
        select: { id: true, nome: true, ano: true },
        orderBy: { nome: 'asc' },
      }),
    ]);

    return [
      {
        tipo: DestinatarioTipo.CATEQUISTA,
        label: 'Todos os Catequistas',
        usuarios: catequistas.map((c) => ({ id: c.id, nome: c.nome, email: c.email })),
      },
      {
        tipo: DestinatarioTipo.RESPONSAVEL,
        label: 'Todos os Responsáveis',
        usuarios: responsaveis.map((r) => ({ id: r.id, nome: r.nome, email: r.email })),
      },
      {
        tipo: DestinatarioTipo.TURMA,
        label: 'Turmas',
        usuarios: turmas.map((t) => ({ id: t.id, nome: `${t.nome} (${t.ano})`, email: '' })),
      },
      {
        tipo: DestinatarioTipo.ADMINISTRADOR,
        label: 'Administradores',
        usuarios: [],
      },
    ];
  }

  private async getCatequistaRecipients(catequistaId: string) {
    const catequista = await this.prisma.catequista.findUnique({
      where: { id: catequistaId },
      include: {
        turmas: {
          include: {
            turma: {
              include: {
                catequizandos: {
                  include: {
                    responsavel: {
                      select: { id: true, nome: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!catequista) {
      throw new BadRequestException('Catequista não encontrado');
    }

    const responsaveisMap = new Map<string, { id: string; nome: string; email: string }>();

    for (const tc of catequista.turmas) {
      for (const catequizando of tc.turma.catequizandos) {
        if (catequizando.responsavel && !responsaveisMap.has(catequizando.responsavel.id)) {
          responsaveisMap.set(catequizando.responsavel.id, {
            id: catequizando.responsavel.id,
            nome: catequizando.responsavel.nome,
            email: catequizando.responsavel.email,
          });
        }
      }
    }

    const admin = await this.prisma.administrador.findFirst({
      select: { id: true, nome: true, email: true },
    });

    const result: { tipo: DestinatarioTipo; label: string; usuarios: { id: string; nome: string; email: string }[] }[] = [];

    if (responsaveisMap.size > 0) {
      result.push({
        tipo: DestinatarioTipo.RESPONSAVEL,
        label: 'Responsáveis das minhas turmas',
        usuarios: Array.from(responsaveisMap.values()),
      });
    }

    if (admin) {
      result.push({
        tipo: DestinatarioTipo.ADMINISTRADOR,
        label: 'Administrador',
        usuarios: [admin],
      });
    }

    return result;
  }

  private async getResponsavelRecipients(responsavelId: string) {
    const responsavel = await this.prisma.responsavel.findUnique({
      where: { id: responsavelId },
      include: {
        catequizandos: {
          include: {
            turma: {
              include: {
                catequistasTurma: {
                  include: {
                    catequista: {
                      select: { id: true, nome: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!responsavel) {
      throw new BadRequestException('Responsável não encontrado');
    }

    const catequistasMap = new Map<string, { id: string; nome: string; email: string }>();
    const admin = await this.prisma.administrador.findFirst({
      select: { id: true, nome: true, email: true },
    });

    for (const catequizando of responsavel.catequizandos) {
      if (catequizando.turma) {
        for (const tc of catequizando.turma.catequistasTurma) {
          if (!catequistasMap.has(tc.catequista.id)) {
            catequistasMap.set(tc.catequista.id, {
              id: tc.catequista.id,
              nome: tc.catequista.nome,
              email: tc.catequista.email,
            });
          }
        }
      }
    }

    const result: { tipo: DestinatarioTipo; label: string; usuarios: { id: string; nome: string; email: string }[] }[] = [];

    if (catequistasMap.size > 0) {
      result.push({
        tipo: DestinatarioTipo.CATEQUISTA,
        label: 'Catequistas dos meus filhos',
        usuarios: Array.from(catequistasMap.values()),
      });
    }

    if (admin) {
      result.push({
        tipo: DestinatarioTipo.ADMINISTRADOR,
        label: 'Administrador',
        usuarios: [admin],
      });
    }

    return result;
  }

  async sendMessage(
    userId: string,
    userRole: string,
    dto: SendMensagemDto,
  ) {
    const remetenteTipo = this.mapRoleToTipo(userRole);

    await this.validateSendingPermission(userId, userRole, dto);

    const destinatarios = await this.buildDestinatarios(userRole, dto);

    const mensagem = await this.prisma.mensagem.create({
      data: {
        remetenteTipo: remetenteTipo as DestinatarioTipo,
        remetenteId: userId,
        assunto: dto.assunto,
        conteudo: dto.conteudo,
        destinatarios: {
          createMany: {
            data: destinatarios.map((d) => ({
              destinatarioTipo: d.tipo,
              destinatarioId: d.id,
            })),
          },
        },
      },
      include: {
        destinatarios: true,
      },
    });

    // Criar notificações para os destinatários
    await this.createNotificationsForMensagem(mensagem, destinatarios);

    return mensagem;
  }

  private async validateSendingPermission(
    userId: string,
    userRole: string,
    dto: SendMensagemDto,
  ) {
    if (userRole === USER_ROLES.ADMINISTRADOR) {
      return; // Admin pode enviar para qualquer um
    }

    if (userRole === USER_ROLES.CATEQUISTA) {
      if (dto.destinatarioTipo === DestinatarioTipo.ADMINISTRADOR) {
        return; // Catequista pode enviar para admin
      }
      if (dto.destinatarioTipo === DestinatarioTipo.RESPONSAVEL) {
        // Validar se os responsáveis são das turmas do catequista
        const catequista = await this.prisma.catequista.findUnique({
          where: { id: userId },
          include: {
            turmas: {
              include: {
                turma: {
                  include: {
                    catequizandos: true,
                  },
                },
              },
            },
          },
        });

        if (!catequista) {
          throw new BadRequestException('Catequista não encontrado');
        }

        const turmaIds = catequista.turmas.map((tc) => tc.turma.id);

        const responsaveisValidos = await this.prisma.catequizando.findMany({
          where: {
            turmaId: { in: turmaIds },
            responsavelId: { in: dto.destinatariosIds },
          },
          select: { responsavelId: true },
        });

        const responsaveisValidosIds = new Set(responsaveisValidos.map((r) => r.responsavelId));
        const allValid = dto.destinatariosIds.every((id) => responsaveisValidosIds.has(id));

        if (!allValid) {
          throw new ForbiddenException(
            'Você só pode enviar mensagens para responsáveis das suas turmas',
          );
        }
        return;
      }
      throw new ForbiddenException('Catequista só pode enviar para responsáveis de suas turmas e administrador');
    }

    if (userRole === USER_ROLES.RESPONSAVEL) {
      if (dto.destinatarioTipo === DestinatarioTipo.ADMINISTRADOR) {
        return; // Responsável pode enviar para admin
      }
      if (dto.destinatarioTipo === DestinatarioTipo.CATEQUISTA) {
        // Validar se os catequistas são das turmas dos filhos do responsável
        const responsavel = await this.prisma.responsavel.findUnique({
          where: { id: userId },
          include: {
            catequizandos: {
              include: {
                turma: {
                  include: {
                    catequistasTurma: true,
                  },
                },
              },
            },
          },
        });

        if (!responsavel) {
          throw new BadRequestException('Responsável não encontrado');
        }

        const catequistasValidosIds = new Set<string>();
        for (const catequizando of responsavel.catequizandos) {
          if (catequizando.turma) {
            for (const tc of catequizando.turma.catequistasTurma) {
              catequistasValidosIds.add(tc.catequistaId);
            }
          }
        }

        const allValid = dto.destinatariosIds.every((id) => catequistasValidosIds.has(id));
        if (!allValid) {
          throw new ForbiddenException(
            'Você só pode enviar mensagens para catequistas das turmas dos seus filhos',
          );
        }
        return;
      }
      throw new ForbiddenException('Responsável só pode enviar para catequistas de seus filhos e administrador');
    }
  }

  private async buildDestinatarios(
    userRole: string,
    dto: SendMensagemDto,
  ): Promise<DestinatarioEntry[]> {
    if (dto.destinatarioTipo === DestinatarioTipo.TURMA) {
      // Enviar para todos os responsáveis e catequistas da turma
      const turma = await this.prisma.turma.findUnique({
        where: { id: dto.destinatariosIds[0] },
        include: {
          catequizandos: {
            include: {
              responsavel: { select: { id: true } },
            },
          },
          catequistasTurma: {
            select: { catequistaId: true },
          },
        },
      });

      if (!turma) {
        throw new BadRequestException('Turma não encontrada');
      }

      const destinatarios: DestinatarioEntry[] = [];

      for (const c of turma.catequizandos) {
        destinatarios.push({
          tipo: DestinatarioTipo.RESPONSAVEL,
          id: c.responsavel.id,
        });
      }

      for (const tc of turma.catequistasTurma) {
        destinatarios.push({
          tipo: DestinatarioTipo.CATEQUISTA,
          id: tc.catequistaId,
        });
      }

      return destinatarios;
    }

    return dto.destinatariosIds.map((id) => ({
      tipo: dto.destinatarioTipo as DestinatarioTipo,
      id,
    }));
  }

  async listMessages(
    userId: string,
    userRole: string,
    query: ListMensagensQueryDto,
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;
    const tipo = this.mapRoleToTipo(userRole) as DestinatarioTipo;

    const where = {
      destinatarios: {
        some: {
          destinatarioTipo: tipo,
          destinatarioId: userId,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.mensagem.findMany({
        where,
        include: {
          destinatarios: {
            where: {
              destinatarioTipo: tipo,
              destinatarioId: userId,
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mensagem.count({ where }),
    ]);

    // Also get sent messages
    const sentWhere = {
      remetenteId: userId,
      remetenteTipo: tipo,
    };

    const [sentData, sentTotal] = await Promise.all([
      this.prisma.mensagem.findMany({
        where: sentWhere,
        include: {
          destinatarios: true,
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mensagem.count({ where: sentWhere }),
    ]);

    const enriched = await Promise.all(
      [...data, ...sentData].map(async (msg) => {
        const remetenteNome = await this.getUserNome(msg.remetenteTipo, msg.remetenteId);
        const destinatariosNomes = await Promise.all(
          msg.destinatarios.map((d) => this.getUserNome(d.destinatarioTipo, d.destinatarioId)),
        );

        return {
          id: msg.id,
          remetente: remetenteNome,
          destinatarios: destinatariosNomes,
          assunto: msg.assunto,
          conteudo: msg.conteudo,
          lida: msg.lida,
          criadoEm: msg.criadoEm,
        };
      }),
    );

    // Sort merged results by date
    enriched.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return {
      data: enriched,
      total: total + sentTotal,
      page,
      limit,
      totalPages: Math.ceil((total + sentTotal) / limit),
    };
  }

  async getUnreadCount(userId: string, userRole: string) {
    const tipo = this.mapRoleToTipo(userRole) as DestinatarioTipo;

    return this.prisma.mensagemDestinatario.count({
      where: {
        destinatarioTipo: tipo,
        destinatarioId: userId,
        lida: false,
      },
    });
  }

  async markAsRead(userId: string, userRole: string, ids: string[]) {
    const tipo = this.mapRoleToTipo(userRole) as DestinatarioTipo;

    await this.prisma.mensagemDestinatario.updateMany({
      where: {
        id: { in: ids },
        destinatarioTipo: tipo,
        destinatarioId: userId,
        lida: false,
      },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    // Also update the main mensagem lida flag if all destinatarios read
    const mensagens = await this.prisma.mensagem.findMany({
      where: {
        destinatarios: {
          some: {
            id: { in: ids },
          },
        },
      },
      include: {
        destinatarios: true,
      },
    });

    for (const msg of mensagens) {
      const allRead = msg.destinatarios.every((d) => d.lida);
      if (allRead) {
        await this.prisma.mensagem.update({
          where: { id: msg.id },
          data: { lida: true, lidaEm: new Date() },
        });
      }
    }

    return { success: true };
  }

  private mapRoleToTipo(role: string): DestinatarioTipo {
    if (role === USER_ROLES.ADMINISTRADOR) return DestinatarioTipo.ADMINISTRADOR;
    if (role === USER_ROLES.CATEQUISTA) return DestinatarioTipo.CATEQUISTA;
    return DestinatarioTipo.RESPONSAVEL;
  }

  private async getUserNome(tipo: DestinatarioTipo, id: string): Promise<string> {
    try {
      if (tipo === DestinatarioTipo.ADMINISTRADOR) {
        const admin = await this.prisma.administrador.findUnique({ where: { id } });
        return admin?.nome || 'Administrador';
      }
      if (tipo === DestinatarioTipo.CATEQUISTA) {
        const cateq = await this.prisma.catequista.findUnique({ where: { id } });
        return cateq?.nome || 'Catequista';
      }
      if (tipo === DestinatarioTipo.RESPONSAVEL) {
        const resp = await this.prisma.responsavel.findUnique({ where: { id } });
        return resp?.nome || 'Responsável';
      }
      return 'Desconhecido';
    } catch {
      return 'Usuário';
    }
  }

  private async createNotificationsForMensagem(
    mensagem: any,
    destinatarios: DestinatarioEntry[],
  ) {
    const notifications = destinatarios.map((d) => ({
      usuarioTipo: d.tipo,
      usuarioId: d.id,
      titulo: `Nova mensagem: ${mensagem.assunto}`,
      descricao: `Você recebeu uma nova mensagem de ${mensagem.remetenteTipo}`,
      tipo: 'INFO',
      prioridade: 'NORMAL',
    }));

    if (notifications.length > 0) {
      await this.prisma.notificacao.createMany({ data: notifications });
    }
  }
}