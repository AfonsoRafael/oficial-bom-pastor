import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Archive,
  BookOpen,
  Calendar,
  ClipboardList,
  Cross,
  DollarSign,
  Folder,
  FolderOpen,
  LogOut,
  Menu,
  Music,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Mock data for historical records
const historicalData = [
  {
    year: 2024,
    turmas: [
      {
        id: 1,
        nome: "Turma A - Nível 1",
        nivel: 1,
        catequista: "Maria Silva",
        catequizandosCount: 12,
        catequizandos: [
          { id: 1, nome: "Ana Carolina Souza", dataNascimento: "2015-03-22" },
          { id: 2, nome: "Bruno Santos Lima", dataNascimento: "2015-07-15" },
          { id: 3, nome: "Clara Oliveira", dataNascimento: "2015-11-08" },
        ],
      },
      {
        id: 2,
        nome: "Turma B - Nível 1",
        nivel: 1,
        catequista: "João Pedro",
        catequizandosCount: 10,
        catequizandos: [
          { id: 4, nome: "Daniel Pereira", dataNascimento: "2016-01-20" },
          { id: 5, nome: "Elena Maria Costa", dataNascimento: "2015-05-10" },
        ],
      },
      {
        id: 3,
        nome: "Turma A - Nível 2",
        nivel: 2,
        catequista: "Fernanda Costa",
        catequizandosCount: 8,
        catequizandos: [
          { id: 6, nome: "Felipe Martins", dataNascimento: "2014-09-05" },
        ],
      },
    ],
  },
  {
    year: 2023,
    turmas: [
      {
        id: 4,
        nome: "Turma A - Nível 1",
        nivel: 1,
        catequista: "Maria Silva",
        catequizandosCount: 15,
        catequizandos: [
          { id: 7, nome: "Gabriela Santos", dataNascimento: "2014-02-14" },
          { id: 8, nome: "Henrique Gomes", dataNascimento: "2014-08-30" },
        ],
      },
      {
        id: 5,
        nome: "Turma B - Nível 1",
        nivel: 1,
        catequista: "Carlos Mendes",
        catequizandosCount: 12,
        catequizandos: [
          { id: 9, nome: "Iris Ferreira", dataNascimento: "2014-06-18" },
        ],
      },
      {
        id: 6,
        nome: "Turma A - Nível 2",
        nivel: 2,
        catequista: "Beatriz Rocha",
        catequizandosCount: 10,
        catequizandos: [
          { id: 10, nome: "João Oliveira", dataNascimento: "2013-04-25" },
          { id: 11, nome: "Karen Lima", dataNascimento: "2013-10-12" },
        ],
      },
      {
        id: 7,
        nome: "Turma B - Nível 2",
        nivel: 2,
        catequista: "Fernanda Costa",
        catequizandosCount: 9,
        catequizandos: [
          { id: 12, nome: "Lucas Alves", dataNascimento: "2013-07-08" },
        ],
      },
    ],
  },
  {
    year: 2022,
    turmas: [
      {
        id: 8,
        nome: "Turma A - Nível 1",
        nivel: 1,
        catequista: "Maria Silva",
        catequizandosCount: 13,
        catequizandos: [
          { id: 13, nome: "Mariana Castro", dataNascimento: "2013-01-19" },
        ],
      },
      {
        id: 9,
        nome: "Turma B - Nível 1",
        nivel: 1,
        catequista: "João Pedro",
        catequizandosCount: 11,
        catequizandos: [
          { id: 14, nome: "Nathalia Barbosa", dataNascimento: "2013-05-03" },
        ],
      },
    ],
  },
];

export default function Historico() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const baseRoute = isAdminRoute ? "/admin" : "/catequista";
  const navVariant = (path: string) =>
    location.pathname === path ? "navActive" : "nav";

  const getColorByLevel = (level: number) => {
    switch (level) {
      case 1:
        return "bg-sage-light text-sage-dark";
      case 2:
        return "bg-gold-light text-gold-dark";
      case 3:
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
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
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Archive className="h-5 w-5 text-primary-foreground" />
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
                <Archive className="mr-3 h-4 w-4" />
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
          <span className="font-display text-lg font-semibold">Histórico</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Histórico de Turmas e Catequizandos
                </h1>
                <p className="text-slate-600">
                  Acompanhe o histórico de todas as turmas separadas por ano
                </p>
              </div>

              {/* Pastas por Ano */}
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {historicalData.map((yearData, yearIndex) => (
                    <AccordionItem key={yearData.year} value={`year-${yearData.year}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-yellow-500" />
                          <span className="text-lg font-semibold">Ano {yearData.year}</span>
                          <Badge variant="secondary">{yearData.turmas.length} turmas</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-8 pt-4">
                          {/* Accordion aninhado para Turmas */}
                          <Accordion type="single" collapsible className="w-full">
                            {yearData.turmas.map((turma) => (
                              <AccordionItem key={turma.id} value={`turma-${turma.id}`}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-3 w-full">
                                    <Folder className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{turma.nome}</span>
                                    <Badge className={getColorByLevel(turma.nivel)}>
                                      Nível {turma.nivel}
                                    </Badge>
                                    <Badge variant="outline" className="ml-auto">
                                      {turma.catequizandosCount} catequizandos
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-4">
                                    <div className="text-sm">
                                      <p className="font-medium text-slate-700">
                                        Catequista: <span className="font-normal">{turma.catequista}</span>
                                      </p>
                                    </div>

                                    {/* Tabela de Catequizandos */}
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-slate-100">
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nome do Catequizando</TableHead>
                                            <TableHead>Data de Nascimento</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {turma.catequizandos.map((catequizando) => (
                                            <TableRow key={catequizando.id}>
                                              <TableCell className="font-medium">
                                                {catequizando.id}
                                              </TableCell>
                                              <TableCell>{catequizando.nome}</TableCell>
                                              <TableCell>
                                                {new Date(
                                                  catequizando.dataNascimento
                                                ).toLocaleDateString("pt-BR")}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
