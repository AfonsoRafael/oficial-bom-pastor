import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { comunicacaoService } from "@/services/comunicacaoService";
import type { DestinatarioGroup, Destinatario } from "@/types/comunicacao";
import { Loader2, Send, Users } from "lucide-react";

interface SendMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendMessageDialog({ isOpen, onClose, onSuccess }: SendMessageDialogProps) {
  const [recipientGroups, setRecipientGroups] = useState<DestinatarioGroup[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [assunto, setAssunto] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadRecipients();
    }
  }, [isOpen]);

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      const groups = await comunicacaoService.getRecipients();
      setRecipientGroups(groups);
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao carregar destinatários",
        variant: "destructive",
      });
    } finally {
      setLoadingRecipients(false);
    }
  };

  const currentGroup = selectedGroupIndex >= 0 ? recipientGroups[selectedGroupIndex] : null;

  const handleRecipientToggle = (id: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!currentGroup) return;
    if (selectedRecipients.length === currentGroup.usuarios.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(currentGroup.usuarios.map((u) => u.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentGroup) {
      toast({
        title: "Selecione um grupo",
        description: "Escolha o tipo de destinatário",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipients.length === 0 && currentGroup.tipo !== "TURMA") {
      toast({
        title: "Selecione destinatários",
        description: "Escolha pelo menos um destinatário",
        variant: "destructive",
      });
      return;
    }

    if (!assunto.trim()) {
      toast({
        title: "Assunto obrigatório",
        description: "Digite um assunto para a mensagem",
        variant: "destructive",
      });
      return;
    }

    if (!conteudo.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Digite o conteúdo da mensagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await comunicacaoService.sendMessage({
        destinatariosIds: currentGroup.tipo === "TURMA" ? [currentGroup.usuarios[0]?.id].filter(Boolean) : selectedRecipients,
        destinatarioTipo: currentGroup.tipo,
        assunto: assunto.trim(),
        conteudo: conteudo.trim(),
        turmaId: currentGroup.tipo === "TURMA" ? currentGroup.usuarios[0]?.id : undefined,
      });

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso.",
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "Erro ao enviar",
        description: err instanceof Error ? err.message : "Ocorreu um erro ao enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedGroupIndex(-1);
    setSelectedRecipients([]);
    setAssunto("");
    setConteudo("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nova Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem para outros usuários do sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Destinatário */}
          <div className="space-y-2">
            <Label>Para quem deseja enviar?</Label>
            <Select
              value={selectedGroupIndex >= 0 ? String(selectedGroupIndex) : ""}
              onValueChange={(value) => {
                const idx = parseInt(value, 10);
                setSelectedGroupIndex(idx);
                setSelectedRecipients([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de destinatário" />
              </SelectTrigger>
              <SelectContent>
                {loadingRecipients ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  recipientGroups.map((group, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{group.label}</span>
                        <span className="text-xs text-muted-foreground">
                          ({group.usuarios.length})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Destinatários */}
          {currentGroup && currentGroup.tipo !== "TURMA" && currentGroup.usuarios.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Selecione os destinatários</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedRecipients.length === currentGroup.usuarios.length
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {currentGroup.usuarios.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedRecipients.includes(user.id)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(user.id)}
                      onChange={() => handleRecipientToggle(user.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.nome}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Turma info */}
          {currentGroup?.tipo === "TURMA" && currentGroup.usuarios.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">
                Enviar para: <span className="text-primary">{currentGroup.usuarios[0]?.nome}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A mensagem será enviada para todos os responsáveis e catequistas desta turma
              </p>
            </div>
          )}

          {/* Assunto */}
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Digite o assunto da mensagem"
              maxLength={200}
            />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="conteudo">Mensagem *</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={5}
              maxLength={5000}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingRecipients}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}