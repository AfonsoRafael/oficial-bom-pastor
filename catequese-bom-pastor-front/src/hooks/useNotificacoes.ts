import { useState, useEffect, useCallback } from "react";
import { notificacaoService } from "@/services/notificacaoService";
import type { Notificacao } from "@/types/notificacao";

interface UseNotificacoesReturn {
  notificacoes: Notificacao[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  loadNotificacoes: (page?: number) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotificacao: (id: string) => Promise<void>;
}

export function useNotificacoes(): UseNotificacoesReturn {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotificacoes = useCallback(async (newPage?: number) => {
    const targetPage = newPage ?? 1;
    setLoading(true);
    setError(null);

    try {
      const response = await notificacaoService.listNotificacoes(targetPage);
      setNotificacoes(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar notificações";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificacaoService.getUnreadCount();
      setUnreadCount(response.count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (ids: string[]) => {
    try {
      await notificacaoService.markAsRead(ids);
      setNotificacoes((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, lida: true, lidaEm: new Date().toISOString() } : n))
      );
      await loadUnreadCount();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao marcar como lida";
      setError(message);
    }
  }, [loadUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificacaoService.markAllAsRead();
      setNotificacoes((prev) =>
        prev.map((n) => ({ ...n, lida: true, lidaEm: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao marcar todas como lidas";
      setError(message);
    }
  }, []);

  const deleteNotificacao = useCallback(async (id: string) => {
    try {
      await notificacaoService.deleteNotificacao(id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      await loadUnreadCount();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover notificação";
      setError(message);
    }
  }, [loadUnreadCount]);

  useEffect(() => {
    loadNotificacoes();
    loadUnreadCount();
  }, [loadNotificacoes, loadUnreadCount]);

  return {
    notificacoes,
    total,
    page,
    totalPages,
    loading,
    error,
    unreadCount,
    loadNotificacoes,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
  };
}