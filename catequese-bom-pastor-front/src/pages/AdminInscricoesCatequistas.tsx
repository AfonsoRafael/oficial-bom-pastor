import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ADMIN_NAV_ITEMS } from "@/lib/sidebarNavItems";
import { fetchWithAuth } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ClipboardList,
  Cross,
  DollarSign,
  Loader2,
  LogOut,
  Menu,
  Music,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  XCircle,
  Plus,
} from "lucide-react";

type InscricaoStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Turma {
  id: string;
  nome: string;
  ano: number;
  catequistasTurma: Array<{
    id: string;
    categoria: "CATEQUISTA" | "AUXILIAR";
    catequista: {
      id: string;
      nome: string;
    };
  }>;
}

interface InscricaoCatequista {
  id: string;
  nome: string;
  dataNascimento: string;
  dataBatismo?: string | null;
  email: string;
  telefone: string;
  casado: string;
  casadaIgrejaCatolica?: string | null;
  sacramentos?: string | null;
  alergias?: string | null;
  status: InscricaoStatus;
  criadoEm: string;
  decisaoEm?: string | null;
  observacoesAdmin?: string | null;
  decisaoPor?: {
    nome: string;
    email: string;
  } | null;
}

// Novas interfaces para o controle de Reuniões e Presença
interface PresencaReuniao {
  catequistaId: string;
  nome: string;
  confirmado: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
}

interface Reuniao {
  id: string;
  titulo: string;
  dataHora: string;
  pauta: string;
  presencas: PresencaReuniao[];
}

const NO_TURMA_VALUE = "__NO_TURMA__";
const CATEGORIA_CATEQUISTA_VALUE = "catequista";
const CATEGORIA_AUXILIAR_VALUE = "auxiliar";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminInscricoesCatequistas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();

  const [loading, setLoading] = useState(false);
  const [turmasLoading, setTurmasLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [inscricoes, setInscricoes] = useState<InscricaoCatequista[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<InscricaoStatus | "ALL" | "REUNIOES">("PENDING");
  
  // Estados para Modal de Aprovação
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [inscricaoToApprove, setInscricaoToApprove] = useState<InscricaoCatequista | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(NO_TURMA_VALUE);
  const [selectedCategoriaTurma, setSelectedCategoriaTurma] = useState<string>(CATEGORIA_CATEQUISTA_VALUE);

  // Novos Estados para o fluxo de Reuniões
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [reuniaoDialogOpen, setReuniaoDialogOpen] = useState(false);
  const [novaReuniao, setNovaReuniao] = useState({ titulo: "", dataHora: "", pauta: "" });

  const isAdminRoute = location.pathname.startsWith("/admin");
  useEffect(() => {
    if (!isAdminRoute) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Apenas administradores podem acessar esta página",
      });
      navigate("/");
      return;
    }

    void carregarTurmas();
    carregarDados();
    // Simulação ou chamada real para buscar reuniões agendadas
    carregarReunioes();
  }, [isAdminRoute]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_ROUTES.catequistasInscricoes}?limit=1000&offset=0`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Falha ao carregar inscricoes de catequista");
      }

      const data = await response.json();
      const list = Array.isArray(data?.inscricoes)
        ? data.inscricoes
        : Array.isArray(data)
          ? data
          : [];

      setInscricoes(
        list.map((item: any) => ({
          id: String(item.id),
          nome: String(item.nome || ""),
          dataNascimento: String(item.dataNascimento || ""),
          dataBatismo: item.dataBatismo || null,
          email: String(item.email || ""),
          telefone: String(item.telefone || ""),
          casado: String(item.casado || ""),
          casadaIgrejaCatolica: item.casadaIgrejaCatolica || null,
          sacramentos: item.sacramentos || null,
          alergias: item.alergias || null,
          status: item.status,
          criadoEm: item.criadoEm,
          decisaoEm: item.decisaoEm || null,
          observacoesAdmin: item.observacoesAdmin || null,
          decisaoPor: item.decisaoPor
            ? {
                nome: String(item.decisaoPor.nome || ""),
                email: String(item.decisaoPor.email || ""),
              }
            : null,
        }))
      );
    } catch (error: any) {
      console.error("Erro ao carregar inscricoes de catequista:", error);
      setInscricoes([]);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Nao foi possivel carregar as inscricoes de catequista",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarTurmas = async () => {
    setTurmasLoading(true);
    try {
      const response = await fetchWithAuth(`${API_ROUTES.turmas}?limit=1000&offset=0`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || "Falha ao carregar turmas");
      }

      const data = await response.json();
      const list = Array.isArray(data?.turmas)
        ? data.turmas
        : Array.isArray(data)
          ? data
          : [];

      setTurmas(
        list.map((item: any) => ({
          id: String(item.id),
          nome: String(item.nome || ""),
          ano: Number(item.ano || 0),
          catequistasTurma: Array.isArray(item.catequistasTurma)
            ? item.catequistasTurma
                .map((vinculo: any) => {
                  if (!vinculo?.catequista?.id) {
                    return null;
                  }

                  return {
                    id: String(vinculo.id || ""),
                    categoria: vinculo.categoria === "AUXILIAR" ? "AUXILIAR" : "CATEQUISTA",
                    catequista: {
                      id: String(vinculo.catequista.id),
                      nome: String(vinculo.catequista.nome || ""),
                    },
                  };
                })
                .filter(Boolean)
            : [],
        }))
      );
    } catch (error: any) {
      console.error("Erro ao carregar turmas:", error);
      setTurmas([]);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Nao foi possivel carregar as turmas",
      });
    } finally {
      setTurmasLoading(false);
    }
  };

  // Mock ou chamada API para preencher as reuniões organizadas
  const carregarReunioes = () => {
    // Exemplo estrutural mockado inicial
    setReunioes([
      {
        id: "1",
        titulo: "Planejamento Semestral da Catequese",
        dataHora: "2026-08-10T19:30",
        pauta: "Definição do calendário litúrgico e distribuição dos materiais didáticos.",
        presencas: [
          { catequistaId: "101", nome: "Maria Silva", confirmado: "CONFIRMADO" },
          { catequistaId: "102", nome: "João Santos", confirmado: "PENDENTE" },
        ],
      },
    ]);
  };

  const filteredInscricoes = useMemo(() => {
    if (selectedStatus === "ALL" || selectedStatus === "REUNIOES") {
      return inscricoes;
    }
    return inscricoes.filter((inscricao) => inscricao.status === selectedStatus);
  }, [inscricoes, selectedStatus]);

  const counts = useMemo(() => {
    return {
      pending: inscricoes.filter((item) => item.status === "PENDING").length,
      approved: inscricoes.filter((item) => item.status === "APPROVED").length,
      rejected: inscricoes.filter((item) => item.status === "REJECTED").length,
      total: inscricoes.length,
    };
  }, [inscricoes]);

  const catequistasAprovados = useMemo(() => {
    return inscricoes.filter((item) => item.status === "APPROVED");
  }, [inscricoes]);

  const selectedTurma = useMemo(() => {
    if (selectedTurmaId === NO_TURMA_VALUE) {
      return null;
    }
    return turmas.find((turma) => turma.id === selectedTurmaId) ?? null;
  }, [selectedTurmaId, turmas]);

  const openApproveDialog = (inscricao: InscricaoCatequista) => {
    setInscricaoToApprove(inscricao);
    setSelectedTurmaId(NO_TURMA_VALUE);
    setSelectedCategoriaTurma(CATEGORIA_CATEQUISTA_VALUE);
    setApproveDialogOpen(true);
  };

  const closeApproveDialog = (open: boolean) => {
    setApproveDialogOpen(open);
    if (!open) {
      setInscricaoToApprove(null);
      setSelectedTurmaId(NO_TURMA_VALUE);
      setSelectedCategoriaTurma(CATEGORIA_CATEQUISTA_VALUE);
    }
  };

  const handleApprove = async () => {
    const currentInscricao = inscricaoToApprove;
    if (!currentInscricao) return;

    setActionLoadingId(currentInscricao.id);
    try {
      const turmaId = selectedTurmaId === NO_TURMA_VALUE ? undefined : selectedTurmaId;
      const response = await fetchWithAuth(API_ROUTES.catequistasInscricoesApprove(currentInscricao.id), {
        method: "PUT",
        body: JSON.stringify({
          ...(turmaId
            ? {
                turmaId,
                categoriaTurma: selectedCategoriaTurma,
              }
            : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Nao foi possivel aprovar a inscricao");
      }

      const turmaSelecionada = turmaId ? turmas.find((turma) => turma.id === turmaId) : null;

      toast({
        title: "Inscricao aprovada",
        description: turmaSelecionada
          ? `${currentInscricao.nome} foi aprovada e alocada em ${turmaSelecionada.nome} como ${
              selectedCategoriaTurma === CATEGORIA_AUXILIAR_VALUE ? "auxiliar" : "catequista"
            }.`
          : `${currentInscricao.nome} foi aprovada sem alocacao em turma.`,
      });

      closeApproveDialog(false);
      await carregarDados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Erro ao aprovar inscricao",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (inscricao: InscricaoCatequista) => {
    setActionLoadingId(inscricao.id);
    try {
      const response = await fetchWithAuth(API_ROUTES.catequistasInscricoesReject(inscricao.id), {
        method: "PUT",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Nao foi possivel reprovar a inscricao");
      }

      toast({
        title: "Inscricao reprovada",
        description: `${inscricao.nome} foi marcada como nao aprovada.`,
      });

      await carregarDados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Erro ao reprovar inscricao",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cadastra nova reunião e injeta automaticamente todos os catequistas ativos
  const handleAgendarReuniao = () => {
    if (!novaReuniao.titulo || !novaReuniao.dataHora) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o título e a data/hora da reunião.",
      });
      return;
    }

    const novasPresencas: PresencaReuniao[] = catequistasAprovados.map((cat) => ({
      catequistaId: cat.id,
      nome: cat.nome,
      confirmado: "PENDENTE",
    }));

    const agendamento: Reuniao = {
      id: String(Date.now()),
      titulo: novaReuniao.titulo,
      dataHora: novaReuniao.dataHora,
      pauta: novaReuniao.pauta,
      presencas: novasPresencas,
    };

    setReunioes([agendamento, ...reunioes]);
    setReuniaoDialogOpen(false);
    setNovaReuniao({ titulo: "", dataHora: "", pauta: "" });

    toast({
      title: "Reunião Agendada",
      description: "A reunião foi criada e a lista de chamada gerada com sucesso.",
    });
  };

  // Altera dinamicamente o status de presença de um catequista na reunião
  const handleAlterarPresenca = (reuniaoId: string, catequistaId: string, novoStatus: "PENDENTE" | "CONFIRMADO" | "RECUSADO") => {
    setReunioes(
      reunioes.map((reuniao) => {
        if (reuniao.id !== reuniaoId) return reuniao;
        return {
          ...reuniao,
          presencas: reuniao.presencas.map((p) =>
            p.catequistaId === catequistaId ? { ...p, confirmado: novoStatus } : p
          ),
        };
      })
    );

    toast({
      title: "Presença atualizada",
      description: "O status da confirmação foi alterado.",
    });
  };

  const statusBadge = (status: InscricaoStatus) => {
    if (status === "APPROVED") return <Badge className="bg-green-600">Aprovada</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">Reprovada</Badge>;
    return <Badge className="bg-orange-600">Pendente</Badge>;
  };

  const statusPresencaBadge = (status: "PENDENTE" | "CONFIRMADO" | "RECUSADO") => {
    if (status === "CONFIRMADO") return <Badge className="bg-green-600">Confirmado</Badge>;
    if (status === "RECUSADO") return <Badge variant="destructive">Recusou</Badge>;
    return <Badge variant="secondary">Pendente</Badge>;
  };

  const renderTable = (items: InscricaoCatequista[]) => (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Dados</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Decisão</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Nenhuma inscricao encontrada.
              </TableCell>
            </TableRow>
          ) : (
            items.map((inscricao) => (
              <TableRow key={inscricao.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{inscricao.nome}</div>
                    <div className="text-xs text-muted-foreground">Enviada em {formatDate(inscricao.criadoEm)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>{inscricao.email}</div>
                    <div className="text-muted-foreground">{inscricao.telefone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Nascimento: {formatDate(inscricao.dataNascimento)}</div>
                    <div>Batismo: {formatDate(inscricao.dataBatismo)}</div>
                    <div>Casado: {inscricao.casado}</div>
                    <div>Igreja Católica: {inscricao.casadaIgrejaCatolica || "-"}</div>
                  </div>
                </TableCell>
                <TableCell>{statusBadge(inscricao.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{inscricao.decisaoPor ? `Por ${inscricao.decisaoPor.nome}` : "-"}</div>
                    <div>{formatDate(inscricao.decisaoEm)}</div>
                    <div className="max-w-xs truncate">{inscricao.observacoesAdmin || "-"}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {inscricao.status === "PENDING" ? (
                      <>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => openApproveDialog(inscricao)}
                          disabled={actionLoadingId === inscricao.id}
                        >
                          {actionLoadingId === inscricao.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleReject(inscricao)}
                          disabled={actionLoadingId === inscricao.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reprovar
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem ações</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const handleLogout = () => {
    try {
      localStorage.removeItem("role");
    } catch {}
    window.location.href = "/login";
  };

  return (
    <div className={`flex min-h-screen bg-background transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Cross className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">Catequese</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="font-medium">Área do Admin</p>
            </div>
          </div>

          <SidebarNav items={ADMIN_NAV_ITEMS} pathname={location.pathname} />

          <div className="border-t p-4">
            <Button
              variant="nav"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1">
        <header className="sticky top-0 z-40 border-b bg-card">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={sidebarOpen ? "lg:hidden" : ""}
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Catequistas</h1>
                <p className="text-sm text-muted-foreground">
                  Revisão separada com aprovação e reprovação administrativas
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Área administrativa
                </div>
                <h1 className="text-3xl font-bold text-foreground">Catequistas</h1>
                <p className="mt-2 text-muted-foreground">
                  Revisão separada das inscrições públicas de catequista e controle de reuniões internas.
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-2xl">{counts.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pendentes</CardDescription>
                  <CardTitle className="text-2xl text-orange-600">{counts.pending}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Aprovadas</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{counts.approved}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Reprovadas</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{counts.rejected}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Painel de Controle</CardTitle>
                  <CardDescription>
                    Gerenciamento de solicitações e chamadas para reuniões com a equipe.
                  </CardDescription>
                </div>
                {selectedStatus === "REUNIOES" && (
                  <Button className="gap-2" onClick={() => setReuniaoDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Marcar Reunião
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                    <TabsTrigger value="APPROVED">Aprovadas</TabsTrigger>
                    <TabsTrigger value="REJECTED">Reprovadas</TabsTrigger>
                    <TabsTrigger value="ALL">Todas</TabsTrigger>
                    <TabsTrigger value="REUNIOES" className="bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> Reuniões
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="REUNIOES" className="space-y-6 m-0 pt-2">
                    {reunioes.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground border rounded-lg">
                        Nenhuma reunião agendada no momento.
                      </div>
                    ) : (
                      reunioes.map((reuniao) => (
                        <Card key={reuniao.id} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{reuniao.titulo}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1 font-medium text-foreground">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {formatDateTime(reuniao.dataHora)}
                                </CardDescription>
                              </div>
                            </div>
                            {reuniao.pauta && <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">{reuniao.pauta}</p>}
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                              Confirmação de Presença ({reuniao.presencas.length})
                            </h4>
                            <div className="overflow-hidden rounded-md border bg-background">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Catequista</TableHead>
                                    <TableHead>Status Atual</TableHead>
                                    <TableHead className="text-right">Mudar Presença</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {reuniao.presencas.map((p) => (
                                    <TableRow key={p.catequistaId}>
                                      <TableCell className="font-medium">{p.nome}</TableCell>
                                      <TableCell>{statusPresencaBadge(p.confirmado)}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button
                                            size="xs"
                                            variant={p.confirmado === "CONFIRMADO" ? "default" : "outline"}
                                            className="h-7 px-2 text-xs"
                                            onClick={() => handleAlterarPresenca(reuniao.id, p.catequistaId, "CONFIRMADO")}
                                          >
                                            Confirmar
                                          </Button>
                                          <Button
                                            size="xs"
                                            variant={p.confirmado === "RECUSADO" ? "destructive" : "outline"}
                                            className="h-7 px-2 text-xs"
                                            onClick={() => handleAlterarPresenca(reuniao.id, p.catequistaId, "RECUSADO")}
                                          >
                                            Recusar
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Abas normais das inscrições */}
                  {selectedStatus !== "REUNIOES" && (
                    <TabsContent value={selectedStatus} className="m-0">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        renderTable(filteredInscricoes)
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>

            {/* Modal para agendar Reunião */}
            <Dialog open={reuniaoDialogOpen} onOpenChange={setReuniaoDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agendar Reunião de Catequistas</DialogTitle>
                  <DialogDescription>
                    Crie um novo evento. Todos os catequistas com cadastro ativo serão incluídos na chamada.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="reuniao-titulo">Título / Assunto</Label>
                    <input
                      id="reuniao-titulo"
                      type="text"
                      className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Ex: Alinhamento da Primeira Eucaristia"
                      value={novaReuniao.titulo}
                      onChange={(e) => setNovaReuniao({ ...novaReuniao, titulo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reuniao-data">Data e Horário</Label>
                    <input
                      id="reuniao-data"
                      type="datetime-local"
                      className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={novaReuniao.dataHora}
                      onChange={(e) => setNovaReuniao({ ...novaReuniao, dataHora: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reuniao-pauta">Pauta / Observações (Opcional)</Label>
                    <textarea
                      id="reuniao-pauta"
                      className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Pontos a serem discutidos..."
                      value={novaReuniao.pauta}
                      onChange={(e) => setNovaReuniao({ ...novaReuniao, pauta: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReuniaoDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAgendarReuniao}>Salvar Agendamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal de Aprovação */}
            <Dialog open={approveDialogOpen} onOpenChange={closeApproveDialog}>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Aprovar inscrição de catequista</DialogTitle>
                  <DialogDescription>
                    Selecione uma turma para alocar o novo catequista agora ou conclua a aprovação sem vínculo.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <div className="font-medium text-foreground">{inscricaoToApprove?.nome || "-"}</div>
                    <div className="mt-1 text-muted-foreground">{inscricaoToApprove?.email || "-"}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turma-approve">Turma</Label>
                    <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId} disabled={turmasLoading}>
                      <SelectTrigger id="turma-approve">
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_TURMA_VALUE}>Sem alocacao</SelectItem>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} {turma.ano ? `- ${turma.ano}` : ""}
                            {turma.catequistasTurma.length > 0 ? ` (${turma.catequistasTurma.length} catequista(s) na turma)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTurmaId !== NO_TURMA_VALUE && (
                    <div className="space-y-2">
                      <Label htmlFor="categoria-turma-approve">Categoria na turma</Label>
                      <Select value={selectedCategoriaTurma} onValueChange={setSelectedCategoriaTurma}>
                        <SelectTrigger id="categoria-turma-approve">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CATEGORIA_CATEQUISTA_VALUE}>Catequista</SelectItem>
                          <SelectItem value={CATEGORIA_AUXILIAR_VALUE}>Auxiliar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedTurma && (
                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">Catequistas da turma</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedTurma.nome} {selectedTurma.ano ? `- ${selectedTurma.ano}` : ""}
                        </div>
                      </div>

                      {selectedTurma.catequistasTurma.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTurma.catequistasTurma.map((vinculo) => (
                            <div key={vinculo.id} className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
                              <span className="font-medium text-foreground">{vinculo.catequista.nome}</span>
                              <Badge variant={vinculo.categoria === "AUXILIAR" ? "secondary" : "default"}>
                                {vinculo.categoria === "AUXILIAR" ? "Auxiliar" : "Catequista"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Esta turma ainda não possui catequistas vinculados.</p>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    É permitido ter mais de um catequista na mesma turma, com categorias diferentes.
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => closeApproveDialog(false)} disabled={actionLoadingId !== null}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void handleApprove()} disabled={actionLoadingId !== null || !inscricaoToApprove}>
                    {actionLoadingId === inscricaoToApprove?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar aprovação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}