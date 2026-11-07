import { useState, useEffect, useCallback } from "react";
import { comunicacaoService } from "@/services/comunicacaoService";
import type { Mensagem, MensagensResponse } from "@/types/comunicacao";

interface UseMensagensReturn {
  mensagens: Mensagem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  loadMessages: (page?: number) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
}

export function useMensagens(): UseMensagensReturn {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async (newPage?: number) => {
    const targetPage = newPage ?? 1;
    setLoading(true);
    setError(null);

    try {
      const response: MensagensResponse = await comunicacaoService.listMessages(targetPage);
      setMensagens(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar mensagens";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await comunicacaoService.getUnreadCount();
      setUnreadCount(typeof response === 'number' ? response : (response as any).count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (ids: string[]) => {
    try {
      await comunicacaoService.markAsRead(ids);
      await loadMessages(page);
      await loadUnreadCount();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao marcar como lida";
      setError(message);
    }
  }, [page, loadMessages, loadUnreadCount]);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [loadMessages, loadUnreadCount]);

  return {
    mensagens,
    total,
    page,
    totalPages,
    loading,
    error,
    unreadCount,
    loadMessages,
    loadUnreadCount,
    markAsRead,
  };
}