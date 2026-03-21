import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { Loader2, UserPlus, Users, AlertCircle, RefreshCw, LogOut, Cross, GraduationCap, BookOpen, Music, Calendar, ClipboardList, Menu, DollarSign, X, Check, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Catequizando {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email?: string;
  telefone?: string;
  turmaId?: string;
  turmaNome?: string;
}

interface Turma {
  id: string;
  nome: string;
  nivel: number;
  catequizandos?: Catequizando[];
}

type PreMatriculaStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PreMatricula {
  id: string;
  nomeCatequizando: string;
  dataNascimento: string;
  nomePais: string;
  email: string;
  telefone: string;
  status: PreMatriculaStatus;
  createdAt: string;
}

export default function AddCatequizando() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [preMatriculas, setPreMatriculas] = useState<PreMatricula[]>([]);
  const [catequizandosSemTurma, setCatequizandosSemTurma] = useState<Catequizando[]>([]);
  const [selectedCatequizando, setSelectedCatequizando] = useState<Catequizando | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const navVariant = (path: string) =>
    location.pathname === path ? "navActive" : "nav";

  // Carregar dados ao montar o componente
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
      const mapCatequizando = (catequizando: any): Catequizando => ({
        id: catequizando.id,
        nome: catequizando.nome,
        dataNascimento: catequizando.dataNascimento,
        cpf: catequizando.cpf || "",
        email: catequizando.email || catequizando.responsavel?.email,
        telefone: catequizando.telefone || catequizando.responsavel?.telefone,
        turmaId: catequizando.turmaId ?? undefined,
        turmaNome: catequizando.turma?.nome,
      });

      const mapPreMatricula = (preMatricula: any): PreMatricula => ({
        id: preMatricula.id,
        nomeCatequizando: preMatricula.nomeCatequizando,
        dataNascimento: preMatricula.dataNascimento,
        nomePais: preMatricula.nomePais,
        email: preMatricula.email,
        telefone: preMatricula.telefone,
        status: preMatricula.status,
        createdAt: preMatricula.createdAt,
      });

      // Carregar turmas
      const turmasResponse = await fetchWithAuth(API_ROUTES.turmas);
      if (turmasResponse.ok) {
        const turmasData = await turmasResponse.json();
        const turmasList = Array.isArray(turmasData?.turmas) ? turmasData.turmas : [];
        setTurmas(
          turmasList.map((turma: any) => ({
            id: turma.id,
            nome: turma.nome,
            nivel: turma.ano,
            catequizandos: Array.isArray(turma.catequizandos)
              ? turma.catequizandos.map(mapCatequizando)
              : [],
          }))
        );
      } else {
        setTurmas([]);
      }

      // Carregar pre-matriculas
      const preMatriculasResponse = await fetchWithAuth(`${API_ROUTES.preMatriculas}?limit=1000&offset=0`);
      if (preMatriculasResponse.ok) {
        const preMatriculasData = await preMatriculasResponse.json();
        const preMatriculasList = Array.isArray(preMatriculasData?.preMatriculas)
          ? preMatriculasData.preMatriculas
          : Array.isArray(preMatriculasData)
            ? preMatriculasData
          : [];
        setPreMatriculas(preMatriculasList.map(mapPreMatricula));
      } else {
        const errorBody = await preMatriculasResponse.json().catch(() => ({}));
        setPreMatriculas([]);
        toast({
          variant: "destructive",
          title: "Erro ao buscar pré-matrículas",
          description: errorBody?.message || `Falha na rota de pré-matrículas (${preMatriculasResponse.status})`,
        });
      }

      // Carregar catequizandos sem turma
      const catequizandosResponse = await fetchWithAuth(API_ROUTES.catequizandos.semTurma);
      if (catequizandosResponse.ok) {
        const catequizandosData = await catequizandosResponse.json();
        const catequizandosList = Array.isArray(catequizandosData?.catequizandos)
          ? catequizandosData.catequizandos
          : [];
        setCatequizandosSemTurma(catequizandosList.map(mapCatequizando));
      } else {
        setCatequizandosSemTurma([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlocarCatequizando = (catequizando: Catequizando) => {
    setSelectedCatequizando(catequizando);
    setSelectedTurmaId(catequizando.turmaId?.toString() || "");
    setDialogOpen(true);
  };

  const getCatequizandoPendenteFromPreMatricula = (preMatricula: PreMatricula) => {
    return catequizandosSemTurma.find((catequizando) => {
      const sameName = catequizando.nome?.trim().toLowerCase() === preMatricula.nomeCatequizando?.trim().toLowerCase();
      const sameBirthDate = new Date(catequizando.dataNascimento).toDateString() === new Date(preMatricula.dataNascimento).toDateString();
      return sameName && sameBirthDate;
    });
  };

  const handleAprovarPreMatricula = async (preMatricula: PreMatricula) => {
    setActionLoadingId(preMatricula.id);
    try {
      const response = await fetchWithAuth(API_ROUTES.preMatriculasApprove(preMatricula.id), {
        method: "PUT",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Não foi possível aprovar a pré-matrícula");
      }

      toast({
        title: "Pré-matrícula aprovada",
        description: `${preMatricula.nomeCatequizando} foi aprovado(a) e já pode ser alocado(a) em uma turma.`,
      });

      await carregarDados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Erro ao aprovar pré-matrícula",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReprovarPreMatricula = async (preMatricula: PreMatricula) => {
    setActionLoadingId(preMatricula.id);
    try {
      const response = await fetchWithAuth(API_ROUTES.preMatriculasReject(preMatricula.id), {
        method: "PUT",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || "Não foi possível reprovar a pré-matrícula");
      }

      toast({
        title: "Pré-matrícula não aceita",
        description: `${preMatricula.nomeCatequizando} foi marcado(a) como não aceito(a).`,
      });

      await carregarDados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Erro ao reprovar pré-matrícula",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmarAlocacao = async () => {
    if (!selectedCatequizando || !selectedTurmaId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma turma",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        API_ROUTES.catequizandos.turma(selectedCatequizando.id),
        {
          method: "PUT",
          body: JSON.stringify({ turmaId: selectedTurmaId }),
        }
      );

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: selectedCatequizando.turmaId
            ? "Catequizando realocado com sucesso"
            : "Catequizando alocado com sucesso",
        });
        setDialogOpen(false);
        setSelectedCatequizando(null);
        setSelectedTurmaId("");
        carregarDados();
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message || "Não foi possível alocar o catequizando",
        });
      }
    } catch (error) {
      console.error("Erro ao alocar catequizando:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao alocar catequizando",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const preMatriculasPendentes = preMatriculas.filter((preMatricula) => preMatricula.status === "PENDING");

  const getStatusBadge = (status: PreMatriculaStatus) => {
    if (status === "APPROVED") {
      return <Badge className="bg-green-600">Aceita</Badge>;
    }

    if (status === "REJECTED") {
      return <Badge variant="destructive">Não aceita</Badge>;
    }

    return <Badge className="bg-orange-600">Pendente</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background lg:pl-64">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Cross className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">
                Catequese
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light">
                <Users className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="font-medium">Área do Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <Button variant={navVariant("/admin")} className="w-full justify-start" asChild>
              <Link to="/admin">
                <Users className="mr-3 h-4 w-4" />
                Gerenciar Turmas
              </Link>
            </Button>
            <Button variant={navVariant("/admin/add-catequizando")} className="w-full justify-start" asChild>
              <Link to="/admin/add-catequizando">
                <UserPlus className="mr-3 h-4 w-4" />
                Adicionar Catequizando
              </Link>
            </Button>
            <Button variant={navVariant("/admin/chamada")} className="w-full justify-start" asChild>
              <Link to="/admin/chamada">
                <ClipboardList className="mr-3 h-4 w-4" />
                Chamada
              </Link>
            </Button>
            <Button variant={navVariant("/admin/minhas-turmas")} className="w-full justify-start" asChild>
              <Link to="/admin/minhas-turmas">
                <GraduationCap className="mr-3 h-4 w-4" />
                Minhas Turmas
              </Link>
            </Button>
            <Button variant={navVariant("/admin/cronograma")} className="w-full justify-start" asChild>
              <Link to="/admin/cronograma">
                <Calendar className="mr-3 h-4 w-4" />
                Cronograma
              </Link>
            </Button>
            <Button variant={navVariant("/admin/material")} className="w-full justify-start" asChild>
              <Link to="/admin/material">
                <BookOpen className="mr-3 h-4 w-4" />
                Material
              </Link>
            </Button>
            <Button variant={navVariant("/admin/musicas")} className="w-full justify-start" asChild>
              <Link to="/admin/musicas">
                <Music className="mr-3 h-4 w-4" />
                Músicas
              </Link>
            </Button>
            <Button variant={navVariant("/admin/contabilidade")} className="w-full justify-start" asChild>
              <Link to="/admin/contabilidade">
                <DollarSign className="mr-3 h-4 w-4" />
                Contabilidade
              </Link>
            </Button>
            <Button variant={navVariant("/admin/historico")} className="w-full justify-start" asChild>
              <Link to="/admin/historico">
                <Calendar className="mr-3 h-4 w-4" />
                Histórico
              </Link>
            </Button>
          </nav>

          {/* Logout */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              asChild
            >
              <Link to="/">
                <LogOut className="mr-3 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-lg font-semibold">
            Adicionar Catequizando
          </span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Gerenciar Catequizandos
              </h1>
              <p className="text-muted-foreground">
                Aloque catequizandos em turmas ou realoque entre turmas
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={carregarDados}
              disabled={loading}
              title="Sincronizar com servidor"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading && !turmas.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="pendentes" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pendentes" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pendentes ({preMatriculasPendentes.length})
                </TabsTrigger>
                <TabsTrigger value="turmas" className="gap-2">
                  <Users className="h-4 w-4" />
                  Por Turma
                </TabsTrigger>
              </TabsList>

              {/* Tab: Catequizandos Pendentes */}
              <TabsContent value="pendentes" className="space-y-4">
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Pré-matrículas
                    </CardTitle>
                    <CardDescription>
                      Aceite ou não aceite pré-matrículas. Ao aceitar, o catequizando fica pronto para alocação em turma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {preMatriculas.length === 0 ? (
                      <div className="text-center py-12">
                        <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">
                          Nenhuma pré-matrícula encontrada
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                          Quando houver novas pré-matrículas, elas aparecerão aqui
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Catequizando</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preMatriculas.map((preMatricula) => {
                            const catequizandoPendente = getCatequizandoPendenteFromPreMatricula(preMatricula);
                            const loadingAction = actionLoadingId === preMatricula.id;

                            return (
                            <TableRow key={preMatricula.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-orange-100 text-orange-700">
                                      {getInitials(preMatricula.nomeCatequizando)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{preMatricula.nomeCatequizando}</p>
                                    <p className="text-sm text-slate-500">
                                      Pré-matrícula em {new Date(preMatricula.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {calcularIdade(preMatricula.dataNascimento)} anos
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {preMatricula.nomePais}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {preMatricula.telefone || preMatricula.email || "-"}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(preMatricula.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                {preMatricula.status === "PENDING" && (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAprovarPreMatricula(preMatricula)}
                                      disabled={loadingAction}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {loadingAction ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-2" />
                                          Aceitar
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReprovarPreMatricula(preMatricula)}
                                      disabled={loadingAction}
                                    >
                                      {loadingAction ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Não aceitar
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {preMatricula.status === "APPROVED" && (
                                  <>
                                    {catequizandoPendente ? (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAlocarCatequizando(catequizandoPendente)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Alocar em turma
                                      </Button>
                                    ) : (
                                      <Badge className="bg-slate-600">Já integrado</Badge>
                                    )}
                                  </>
                                )}

                                {preMatricula.status === "REJECTED" && (
                                  <Badge variant="outline">Sem ação</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Catequizandos sem turma
                    </CardTitle>
                    <CardDescription>
                      Lista geral dos catequizandos já cadastrados e ainda não alocados em turma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {catequizandosSemTurma.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6">Nenhum catequizando sem turma no momento.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Catequizando</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {catequizandosSemTurma.map((catequizando) => (
                            <TableRow key={catequizando.id}>
                              <TableCell className="font-medium">{catequizando.nome}</TableCell>
                              <TableCell>{calcularIdade(catequizando.dataNascimento)} anos</TableCell>
                              <TableCell className="text-slate-600">
                                {catequizando.telefone || catequizando.email || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleAlocarCatequizando(catequizando)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Alocar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Catequizandos por Turma */}
              <TabsContent value="turmas" className="space-y-4">
                {turmas.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">
                        Nenhuma turma cadastrada
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  turmas.map((turma) => (
                    <Card key={turma.id} className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {turma.nome}
                              <Badge className="bg-blue-600">
                                Nível {turma.nivel}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {turma.catequizandos?.length || 0} catequizando(s)
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {!turma.catequizandos || turma.catequizandos.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-slate-500">
                              Nenhum catequizando nesta turma
                            </p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Catequizando</TableHead>
                                <TableHead>Idade</TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {turma.catequizandos.map((catequizando) => (
                                <TableRow key={catequizando.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                          {getInitials(catequizando.nome)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{catequizando.nome}</p>
                                        <p className="text-sm text-slate-500">
                                          {new Date(catequizando.dataNascimento).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {calcularIdade(catequizando.dataNascimento)} anos
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    {catequizando.cpf}
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    {catequizando.telefone || catequizando.email || "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAlocarCatequizando(catequizando)}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Realocar
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* Dialog de Alocação/Realocação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCatequizando?.turmaId ? "Realocar" : "Alocar"} Catequizando
            </DialogTitle>
            <DialogDescription>
              {selectedCatequizando?.turmaId
                ? `Mover ${selectedCatequizando?.nome} para outra turma`
                : `Alocar ${selectedCatequizando?.nome} em uma turma`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {selectedCatequizando && getInitials(selectedCatequizando.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedCatequizando?.nome}</p>
                  <p className="text-sm text-slate-600">
                    {selectedCatequizando?.dataNascimento &&
                      `${calcularIdade(selectedCatequizando.dataNascimento)} anos`}
                  </p>
                </div>
              </div>
              {selectedCatequizando?.turmaId && (
                <p className="mt-3 text-sm text-slate-600">
                  Turma atual: <span className="font-semibold">{selectedCatequizando.turmaNome}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione a turma</label>
              <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id.toString()}>
                      {turma.nome} - Nível {turma.nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedCatequizando(null);
                setSelectedTurmaId("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmarAlocacao} disabled={!selectedTurmaId || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
