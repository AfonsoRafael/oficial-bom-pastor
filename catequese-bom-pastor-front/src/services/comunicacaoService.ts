import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import type { DestinatarioGroup, Mensagem, MensagensResponse, SendMensagemData } from "@/types/comunicacao";

export interface UnreadCountResponse {
  count: number;
}

export const comunicacaoService = {
  async getRecipients(turmaId?: string): Promise<DestinatarioGroup[]> {
    const params = turmaId ? `?turmaId=${turmaId}` : "";
    const response = await api.get(`${API_ROUTES.comunicacao.recipients}${params}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao carregar destinatários");
    }
    return response.json();
  },

  async sendMessage(data: SendMensagemData): Promise<Mensagem> {
    const response = await api.post(API_ROUTES.comunicacao.send, data);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao enviar mensagem");
    }
    return response.json();
  },

  async listMessages(page = 1, limit = 20): Promise<MensagensResponse> {
    const response = await api.get(
      `${API_ROUTES.comunicacao.messages}?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao carregar mensagens");
    }
    return response.json();
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get(API_ROUTES.comunicacao.unreadCount);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao carregar contagem");
    }
    return response.json();
  },

  async markAsRead(ids: string[]): Promise<void> {
    const response = await api.post(API_ROUTES.comunicacao.markAsRead, { ids });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao marcar como lida");
    }
  },
};