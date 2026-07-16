export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'INFO' | 'AVISO' | 'URGENTE' | 'SUCESSO' | 'ERRO';
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  lida: boolean;
  lidaEm: string | null;
  linkRelacionado: string | null;
  criadoEm: string;
}

export interface NotificacoesResponse {
  data: Notificacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}