import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Cross,
  DollarSign,
  Gift,
  GraduationCap,
  LogOut,
  Menu,
  Music,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { Link, useLocation } from "react-router-dom";

type Sale = { id: string; product: string; qty: number; price: number };
type Purchase = { id: string; item: string; qty: number; cost: number };

const Contabilidade = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const location = useLocation();

  const navVariant = (path: string) =>
    location.pathname === path ? "navActive" : "nav";

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // Dados da lojinha (vendas)
  const [sales, setSales] = useState<Sale[]>([
    { id: "S-001", product: "Camiseta", qty: 2, price: 45 },
    { id: "S-002", product: "Terço Infantil", qty: 3, price: 15 },
    { id: "S-003", product: "Caneca", qty: 1, price: 30 },
  ]);

  // Compras previstas
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: "P-001", item: "Bíblias", qty: 5, cost: 40 },
    { id: "P-002", item: "Material Escolar", qty: 20, cost: 3 },
  ]);

  const totalRevenue = useMemo(
    () => sales.reduce((acc, s) => acc + s.qty * s.price, 0),
    [sales]
  );

  const totalPlanned = useMemo(
    () => purchases.reduce((acc, p) => acc + p.qty * p.cost, 0),
    [purchases]
  );

  const balance = useMemo(
    () => totalRevenue - totalPlanned,
    [totalRevenue, totalPlanned]
  );

  // Dados mockados de transações gerais
  const transactions = [
    { id: 1, date: "2024-01-15", description: "Materiais didáticos", type: "despesa", value: 150.00, category: "Material" },
    { id: 2, date: "2024-01-10", description: "Mensalidade - Turma A", type: "receita", value: 450.00, category: "Mensalidade" },
    { id: 3, date: "2024-01-08", description: "Instrumentos musicais", type: "despesa", value: 300.00, category: "Música" },
    { id: 4, date: "2024-01-05", description: "Mensalidade - Turma B", type: "receita", value: 400.00, category: "Mensalidade" },
    { id: 5, date: "2024-01-03", description: "Lanche para evento", type: "despesa", value: 80.00, category: "Eventos" },
  ];

  const totalReceitas = transactions
    .filter(t => t.type === "receita")
    .reduce((sum, t) => sum + t.value, 0);

  const totalDespesas = transactions
    .filter(t => t.type === "despesa")
    .reduce((sum, t) => sum + t.value, 0);

  const saldo = totalReceitas - totalDespesas;

  const totalItemsVendidos = useMemo(
    () => sales.reduce((acc, s) => acc + s.qty, 0),
    [sales]
  );

  return (
    <div className={`flex min-h-screen bg-background transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
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
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
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
                <Users className="mr-3 h-4 w-4" />
                Adicionar Catequizando
              </Link>
            </Button>
            <Button variant={navVariant("/admin/inscricoes-catequistas")} className="w-full justify-start" asChild>
              <Link to="/admin/inscricoes-catequistas">
                <ClipboardList className="mr-3 h-4 w-4" />
                Inscrições de Catequista
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
                <Users className="mr-3 h-4 w-4" />
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className={sidebarOpen ? "lg:hidden" : ""}
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-lg font-semibold">
            Contabilidade
          </span>
          <div className="w-10" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList>
              <TabsTrigger value="geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="lojinha">Lojinha</TabsTrigger>
              <TabsTrigger value="compras">Compras Previstas</TabsTrigger>
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="geral" className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {totalReceitas.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mensalidades e outras entradas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      R$ {totalDespesas.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Materiais, eventos e outras saídas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {saldo.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saldo atual
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo da Lojinha e Compras */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingCart className="h-5 w-5" /> Vendas Lojinha
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totalItemsVendidos}</p>
                    <p className="text-sm text-muted-foreground">Itens vendidos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5" /> Receita Lojinha
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {totalRevenue.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-sm text-muted-foreground">Total arrecadado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Gift className="h-5 w-5" /> Compras Previstas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {totalPlanned.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-sm text-muted-foreground">Custo planejado</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Saldo Lojinha</CardTitle>
                  <CardDescription>Receita da lojinha - Compras previstas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    R$ {balance.toFixed(2).replace(".", ",")}
                  </p>
                </CardContent>
              </Card>

              {/* Tabela de Transações */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transações Recentes</CardTitle>
                      <CardDescription>
                        Histórico de receitas e despesas da catequese
                      </CardDescription>
                    </div>
                    <Button>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Nova Transação
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.type === "receita" ? "default" : "destructive"}
                            >
                              {transaction.type === "receita" ? "Receita" : "Despesa"}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === "receita" ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.type === "receita" ? "+" : "-"} R$ {transaction.value.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Lojinha */}
            <TabsContent value="lojinha" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas da Lojinha</CardTitle>
                  <CardDescription>Edição rápida dos registros de vendas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtde</TableHead>
                        <TableHead>Preço (R$)</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((s, idx) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Input
                              value={s.product}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSales((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, product: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="w-32">
                            <Input
                              type="number"
                              value={s.qty}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setSales((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, qty: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="w-40">
                            <Input
                              type="number"
                              step="0.01"
                              value={s.price}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setSales((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, price: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {(s.qty * s.price).toFixed(2).replace(".", ",")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSales((prev) => [
                          ...prev,
                          {
                            id: `S-${String(prev.length + 1).padStart(3, "0")}`,
                            product: "Novo Produto",
                            qty: 1,
                            price: 0,
                          },
                        ])
                      }
                    >
                      Adicionar venda
                    </Button>
                    <Button>Salvar alterações</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de itens vendidos:</span>
                      <span className="font-bold">{totalItemsVendidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Receita total:</span>
                      <span className="font-bold text-green-600">
                        R$ {totalRevenue.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Compras Previstas */}
            <TabsContent value="compras" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compras Previstas</CardTitle>
                  <CardDescription>Materiais e itens a serem adquiridos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qtde</TableHead>
                        <TableHead>Custo (R$)</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((p, idx) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Input
                              value={p.item}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPurchases((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, item: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="w-32">
                            <Input
                              type="number"
                              value={p.qty}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setPurchases((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, qty: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="w-40">
                            <Input
                              type="number"
                              step="0.01"
                              value={p.cost}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setPurchases((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, cost: v } : row
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {(p.qty * p.cost).toFixed(2).replace(".", ",")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPurchases((prev) => [
                          ...prev,
                          {
                            id: `P-${String(prev.length + 1).padStart(3, "0")}`,
                            item: "Novo Item",
                            qty: 1,
                            cost: 0,
                          },
                        ])
                      }
                    >
                      Adicionar compra
                    </Button>
                    <Button>Salvar alterações</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de itens:</span>
                      <span className="font-bold">
                        {purchases.reduce((acc, p) => acc + p.qty, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo total previsto:</span>
                      <span className="font-bold text-red-600">
                        R$ {totalPlanned.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Contabilidade;