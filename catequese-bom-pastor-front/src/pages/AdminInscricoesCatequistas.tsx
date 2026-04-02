import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { Check, ChevronLeft, Loader2, RefreshCw, XCircle, Users, ShieldCheck } from "lucide-react";

type InscricaoStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  createdAt: string;
  decisaoEm?: string | null;
  observacoesAdmin?: string | null;
  decisaoPor?: {
    nome: string;
    email: string;
  } | null;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export default function AdminInscricoesCatequistas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [inscricoes, setInscricoes] = useState<InscricaoCatequista[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<InscricaoStatus | "ALL">("PENDING");

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

    carregarDados();
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
          createdAt: item.createdAt,
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

  const filteredInscricoes = useMemo(() => {
    if (selectedStatus === "ALL") {
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

  const handleApprove = async (inscricao: InscricaoCatequista) => {
    setActionLoadingId(inscricao.id);
    try {
      const response = await fetchWithAuth(API_ROUTES.catequistasInscricoesApprove(inscricao.id), {
        method: "PUT",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Nao foi possivel aprovar a inscricao");
      }

      toast({
        title: "Inscricao aprovada",
        description: `${inscricao.nome} foi aprovada e já pode acessar o sistema.`,
      });

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

  const statusBadge = (status: InscricaoStatus) => {
    if (status === "APPROVED") {
      return <Badge className="bg-green-600">Aprovada</Badge>;
    }

    if (status === "REJECTED") {
      return <Badge variant="destructive">Reprovada</Badge>;
    }

    return <Badge className="bg-orange-600">Pendente</Badge>;
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
                    <div className="text-xs text-muted-foreground">Enviada em {formatDate(inscricao.createdAt)}</div>
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
                          onClick={() => handleApprove(inscricao)}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Área administrativa
            </div>
            <h1 className="text-3xl font-bold text-foreground">Inscrições de Catequista</h1>
            <p className="mt-2 text-muted-foreground">
              Revisão separada das inscrições públicas de catequista, com aprovação e reprovação próprias.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/add-catequizando" className="gap-2">
                <Users className="h-4 w-4" />
                Ver pré-matrículas
              </Link>
            </Button>
            <Button variant="outline" onClick={carregarDados} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
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
          <CardHeader>
            <CardTitle>Fila de análise</CardTitle>
            <CardDescription>
              Cada inscrição é tratada de forma independente do fluxo de catequizando.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as InscricaoStatus | "ALL")} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                <TabsTrigger value="APPROVED">Aprovadas</TabsTrigger>
                <TabsTrigger value="REJECTED">Reprovadas</TabsTrigger>
                <TabsTrigger value="ALL">Todas</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedStatus} className="m-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  renderTable(filteredInscricoes)
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}