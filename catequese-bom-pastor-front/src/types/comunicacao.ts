export interface DestinatarioGroup {
  tipo: 'ADMINISTRADOR' | 'CATEQUISTA' | 'RESPONSAVEL' | 'TURMA';
  label: string;
  usuarios: Destinatario[];
}

export interface Destinatario {
  id: string;
  nome: string;
  email: string;
}

export interface SendMensagemData {
  destinatariosIds: string[];
  destinatarioTipo: string;
  assunto: string;
  conteudo: string;
  turmaId?: string;
}

export interface Mensagem {
  id: string;
  remetente: string;
  destinatarios: string[];
  assunto: string;
  conteudo: string;
  lida: boolean;
  criadoEm: string;
}

export interface MensagensResponse {
  data: Mensagem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}