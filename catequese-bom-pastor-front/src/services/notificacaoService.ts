import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import type { Notificacao, NotificacoesResponse } from "@/types/notificacao";

export const notificacaoService = {
  async listNotificacoes(page = 1, limit = 20, apenasNaoLidas?: boolean): Promise<NotificacoesResponse> {
    let url = `${API_ROUTES.notificacoes.base}?page=${page}&limit=${limit}`;
    if (apenasNaoLidas) {
      url += "&apenasNaoLidas=true";
    }
    const response = await api.get(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao carregar notificações");
    }
    return response.json();
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get(API_ROUTES.notificacoes.unreadCount);
    if (!response.ok) {
      return { count: 0 };
    }
    return response.json();
  },

  async markAsRead(ids: string[]): Promise<void> {
    const response = await api.post(API_ROUTES.notificacoes.markAsRead, { ids });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao marcar notificação como lida");
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await api.post(API_ROUTES.notificacoes.markAllAsRead);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao marcar todas como lidas");
    }
  },

  async deleteNotificacao(id: string): Promise<void> {
    const response = await api.delete(`${API_ROUTES.notificacoes.base}/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao remover notificação");
    }
  },
};