import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import type { Notificacao } from "@/types/notificacao";
import { useAuth } from "@/contexts/AuthContext";

function getTipoIcon(tipo: Notificacao["tipo"]) {
  switch (tipo) {
    case "INFO":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "AVISO":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "URGENTE":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "SUCESSO":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "ERRO":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function getPrioridadeClass(prioridade: Notificacao["prioridade"]) {
  switch (prioridade) {
    case "URGENTE":
      return "border-l-4 border-l-red-500";
    case "ALTA":
      return "border-l-4 border-l-orange-500";
    case "NORMAL":
      return "border-l-4 border-l-blue-500";
    case "BAIXA":
      return "border-l-4 border-l-gray-300";
    default:
      return "";
  }
}

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useAuth();
  const {
    notificacoes,
    loading,
    unreadCount,
    loadNotificacoes,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
  } = useNotificacoes();
  const { toast } = useToast();

  const handleNotificationClick = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      await markAsRead([notificacao.id]);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Notificações",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao marcar notificações",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotificacao(id);
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao remover notificação",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  onClick={() => handleNotificationClick(notificacao)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                    !notificacao.lida ? "bg-primary/5" : ""
                  } ${getPrioridadeClass(notificacao.prioridade)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {getTipoIcon(notificacao.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notificacao.lida ? "font-semibold" : ""
                          } truncate`}
                        >
                          {notificacao.titulo}
                        </p>
                        <button
                          onClick={(e) => handleDelete(e, notificacao.id)}
                          className="flex-shrink-0 p-0.5 hover:bg-muted rounded transition-colors"
                          aria-label="Remover notificação"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notificacao.descricao}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notificacao.criadoEm).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}