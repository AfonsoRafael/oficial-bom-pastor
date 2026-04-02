import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Calendar as CalendarNav,
  ClipboardList,
  Clock,
  Cross,
  DollarSign,
  Download,
  Eye,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Music,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { Link, useLocation } from "react-router-dom";

interface DocumentInfo {
  status: boolean;
  uploadDate: string | null;
  fileName?: string;
}

interface Student {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  cpf: string;
  documents: {
    birthCertificate: DocumentInfo;
    cpf: DocumentInfo;
    vaccineCard: DocumentInfo;
  };
  attendanceDates: {
    percentage: number;
    absenceDates: string[];
  };
  avatar: string;
}

interface Turma {
  id: number;
  name: string;
  level: number;
  schedule: string;
  room: string;
  students: Student[];
}

// Mock data
const mockTurmas: Turma[] = [
  {
    id: 1,
    name: "Turma A - Nível 1",
    level: 1,
    schedule: "Sábados, 9h às 11h",
    room: "Sala 1",
    students: [
      {
        id: 1,
        name: "Ana Carolina Souza",
        birthDate: "2015-03-22",
        phone: "(11) 98765-4321",
        email: "ana.souza@email.com",
        address: "Rua das Flores, 123 - São Paulo, SP",
        cpf: "123.456.789-00",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_ana.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_ana.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_ana.pdf",
          },
        },
        attendanceDates: {
          percentage: 85,
          absenceDates: ["2024-11-02", "2024-11-16"],
        },
        avatar: "AS",
      },
      {
        id: 2,
        name: "Bruno Santos Lima",
        birthDate: "2015-07-15",
        phone: "(11) 99876-5432",
        email: "bruno.lima@email.com",
        address: "Avenida Paulista, 456 - São Paulo, SP",
        cpf: "234.567.890-11",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_bruno.pdf",
          },
          cpf: { status: false, uploadDate: null },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_bruno.pdf",
          },
        },
        attendanceDates: {
          percentage: 92,
          absenceDates: ["2024-12-07"],
        },
        avatar: "BL",
      },
      {
        id: 3,
        name: "Clara Oliveira",
        birthDate: "2015-11-08",
        phone: "(11) 97654-3210",
        email: "clara.oliveira@email.com",
        address: "Rua Consolação, 789 - São Paulo, SP",
        cpf: "345.678.901-22",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_clara.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_clara.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_clara.pdf",
          },
        },
        attendanceDates: {
          percentage: 78,
          absenceDates: [
            "2024-11-02",
            "2024-11-09",
            "2024-11-23",
            "2024-12-07",
          ],
        },
        avatar: "CO",
      },
      {
        id: 4,
        name: "Daniel Pereira",
        birthDate: "2016-01-20",
        phone: "(11) 98765-6543",
        email: "daniel.pereira@email.com",
        address: "Rua Augusta, 234 - São Paulo, SP",
        cpf: "456.789.012-33",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_daniel.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_daniel.pdf",
          },
          vaccineCard: { status: false, uploadDate: null },
        },
        attendanceDates: {
          percentage: 88,
          absenceDates: ["2024-11-30"],
        },
        avatar: "DP",
      },
      {
        id: 5,
        name: "Elena Maria Costa",
        birthDate: "2015-05-10",
        phone: "(11) 99123-4567",
        email: "elena.costa@email.com",
        address: "Rua Oscar Freire, 567 - São Paulo, SP",
        cpf: "567.890.123-44",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_elena.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_elena.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_elena.pdf",
          },
        },
        attendanceDates: {
          percentage: 95,
          absenceDates: [],
        },
        avatar: "EC",
      },
      {
        id: 6,
        name: "Felipe Rodrigues",
        birthDate: "2016-02-14",
        phone: "(11) 97891-2345",
        email: "felipe.rodrigues@email.com",
        address: "Rua Pamplona, 890 - São Paulo, SP",
        cpf: "678.901.234-55",
        documents: {
          birthCertificate: { status: false, uploadDate: null },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_felipe.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_felipe.pdf",
          },
        },
        attendanceDates: {
          percentage: 75,
          absenceDates: [
            "2024-10-26",
            "2024-11-02",
            "2024-11-16",
            "2024-12-07",
          ],
        },
        avatar: "FR",
      },
      {
        id: 7,
        name: "Gabriela Fernandes",
        birthDate: "2015-08-30",
        phone: "(11) 98345-6789",
        email: "gabriela.fernandes@email.com",
        address: "Rua Haddock Lobo, 345 - São Paulo, SP",
        cpf: "789.012.345-66",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_gabriela.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_gabriela.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_gabriela.pdf",
          },
        },
        attendanceDates: {
          percentage: 90,
          absenceDates: ["2024-12-14"],
        },
        avatar: "GF",
      },
      {
        id: 8,
        name: "Henrique Almeida",
        birthDate: "2016-04-03",
        phone: "(11) 99234-5678",
        email: "henrique.almeida@email.com",
        address: "Rua Bela Cintra, 678 - São Paulo, SP",
        cpf: "890.123.456-77",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_henrique.pdf",
          },
          cpf: { status: false, uploadDate: null },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_henrique.pdf",
          },
        },
        attendanceDates: {
          percentage: 82,
          absenceDates: ["2024-11-23", "2024-12-07"],
        },
        avatar: "HA",
      },
    ],
  },
  {
    id: 2,
    name: "Turma B - Nível 2",
    level: 2,
    schedule: "Sábados, 11h às 13h",
    room: "Sala 2",
    students: [
      {
        id: 9,
        name: "Isabela Martins",
        birthDate: "2014-09-12",
        phone: "(11) 98765-1234",
        email: "isabela.martins@email.com",
        address: "Avenida Brasil, 111 - São Paulo, SP",
        cpf: "901.234.567-88",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_isabela.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_isabela.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_isabela.pdf",
          },
        },
        attendanceDates: {
          percentage: 88,
          absenceDates: ["2024-11-09"],
        },
        avatar: "IM",
      },
      {
        id: 10,
        name: "João Paulo Silva",
        birthDate: "2014-06-25",
        phone: "(11) 99876-2345",
        email: "joao.silva@email.com",
        address: "Rua Vergueiro, 222 - São Paulo, SP",
        cpf: "012.345.678-99",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_joao.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_joao.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_joao.pdf",
          },
        },
        attendanceDates: {
          percentage: 91,
          absenceDates: [],
        },
        avatar: "JP",
      },
      {
        id: 11,
        name: "Karina Souza",
        birthDate: "2014-12-08",
        phone: "(11) 97654-1234",
        email: "karina.souza@email.com",
        address: "Rua 13 de Maio, 333 - São Paulo, SP",
        cpf: "123.456.789-01",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_karina.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_karina.pdf",
          },
          vaccineCard: { status: false, uploadDate: null },
        },
        attendanceDates: {
          percentage: 79,
          absenceDates: [
            "2024-11-02",
            "2024-11-16",
            "2024-12-07",
            "2024-12-14",
          ],
        },
        avatar: "KS",
      },
      {
        id: 12,
        name: "Lucas Gomes",
        birthDate: "2014-03-17",
        phone: "(11) 98765-2345",
        email: "lucas.gomes@email.com",
        address: "Rua Maria Antônia, 444 - São Paulo, SP",
        cpf: "234.567.890-12",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_lucas.pdf",
          },
          cpf: { status: false, uploadDate: null },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_lucas.pdf",
          },
        },
        attendanceDates: {
          percentage: 87,
          absenceDates: ["2024-11-30"],
        },
        avatar: "LG",
      },
      {
        id: 13,
        name: "Mariana Cardoso",
        birthDate: "2014-07-22",
        phone: "(11) 99123-2345",
        email: "mariana.cardoso@email.com",
        address: "Avenida Tomás Edson, 555 - São Paulo, SP",
        cpf: "345.678.901-23",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_mariana.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_mariana.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_mariana.pdf",
          },
        },
        attendanceDates: {
          percentage: 93,
          absenceDates: [],
        },
        avatar: "MC",
      },
    ],
  },
  {
    id: 3,
    name: "Turma C - Nível 3",
    level: 3,
    schedule: "Domingos, 10h às 12h",
    room: "Sala 3",
    students: [
      {
        id: 14,
        name: "Nicolas Ribeiro",
        birthDate: "2013-05-30",
        phone: "(11) 98765-3456",
        email: "nicolas.ribeiro@email.com",
        address: "Rua Capote Valente, 666 - São Paulo, SP",
        cpf: "456.789.012-34",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_nicolas.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_nicolas.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_nicolas.pdf",
          },
        },
        attendanceDates: {
          percentage: 86,
          absenceDates: ["2024-12-07"],
        },
        avatar: "NR",
      },
      {
        id: 15,
        name: "Olivia Santos",
        birthDate: "2013-09-14",
        phone: "(11) 99876-3456",
        email: "olivia.santos@email.com",
        address: "Rua Bandeira Paulista, 777 - São Paulo, SP",
        cpf: "567.890.123-45",
        documents: {
          birthCertificate: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "certidao_nascimento_olivia.pdf",
          },
          cpf: {
            status: true,
            uploadDate: "2024-10-15",
            fileName: "cpf_olivia.pdf",
          },
          vaccineCard: {
            status: true,
            uploadDate: "2024-10-20",
            fileName: "cartao_vacinacao_olivia.pdf",
          },
        },
        attendanceDates: {
          percentage: 94,
          absenceDates: [],
        },
        avatar: "OS",
      },
    ],
  },
];

export default function MinhasTurmas() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setIsAdmin((localStorage.getItem("role") || "guest") === "admin");
  }, []);
  
  // Detecta se está em rota de admin ou catequista
  const baseRoute = location.pathname.startsWith('/admin') ? '/admin' : '/catequista';
  const isAdminRoute = baseRoute === '/admin';
  
  const navVariant = (path: string) =>
    location.pathname === path ? "navActive" : "nav";
  const [selectedTurma, setSelectedTurma] = useState<Turma>(mockTurmas[0]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [documentPreview, setDocumentPreview] = useState<{
    type: string;
    doc: DocumentInfo;
  } | null>(null);

  const filteredStudents = selectedTurma.students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const filteredTurmas =
    filterLevel === "all"
      ? mockTurmas
      : mockTurmas.filter((t) => t.level === parseInt(filterLevel));

  return (
    <div className={`flex min-h-screen bg-background transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } `}
      >
        <div className="flex h-full flex-col">
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

          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light">
                <Users className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="font-medium">{isAdminRoute ? 'Área do Admin' : 'Área do Catequista'}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {isAdminRoute && (
              <Button
                variant={navVariant('/admin')}
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin">
                  <Users className="mr-3 h-4 w-4" />
                  Gerenciar Turmas
                </Link>
              </Button>
            )}
            {isAdminRoute && (
              <Button variant={navVariant('/admin/add-catequizando')} className="w-full justify-start" asChild>
                <Link to="/admin/add-catequizando">
                  <Users className="mr-3 h-4 w-4" />
                  Adicionar Catequizando
                </Link>
              </Button>
            )}
            {isAdminRoute && (
              <Button variant={navVariant('/admin/inscricoes-catequistas')} className="w-full justify-start" asChild>
                <Link to="/admin/inscricoes-catequistas">
                  <ClipboardList className="mr-3 h-4 w-4" />
                  Inscrições de Catequista
                </Link>
              </Button>
            )}
            <Button
              variant={navVariant(`${baseRoute}/chamada`)}
              className="w-full justify-start"
              asChild
            >
              <Link to={`${baseRoute}/chamada`}>
                <ClipboardList className="mr-3 h-4 w-4" />
                Chamada
              </Link>
            </Button>
            <Button
              variant={navVariant(`${baseRoute}/minhas-turmas`)}
              className="w-full justify-start"
              asChild
            >
              <Link to={`${baseRoute}/minhas-turmas`}>
                <Users className="mr-3 h-4 w-4" />
                {'Minhas Turmas'}
              </Link>
            </Button>
            <Button
              variant={navVariant(`${baseRoute}/cronograma`)}
              className="w-full justify-start"
              asChild
            >
              <Link to={`${baseRoute}/cronograma`}>
                <CalendarNav className="mr-3 h-4 w-4" />
                Cronograma
              </Link>
            </Button>
            <Button
              variant={navVariant(`${baseRoute}/material`)}
              className="w-full justify-start"
              asChild
            >
              <Link to={`${baseRoute}/material`}>
                <BookOpen className="mr-3 h-4 w-4" />
                Material
              </Link>
            </Button>
            <Button
              variant={navVariant(`${baseRoute}/musicas`)}
              className="w-full justify-start"
              asChild
            >
              <Link to={`${baseRoute}/musicas`}>
                <Music className="mr-3 h-4 w-4" />
                Músicas
              </Link>
            </Button>
            {isAdminRoute && (
              <Button variant={navVariant("/admin/contabilidade")} className="w-full justify-start" asChild>
                <Link to="/admin/contabilidade">
                  <DollarSign className="mr-3 h-4 w-4" />
                  Contabilidade
                </Link>
              </Button>
            )}
            {isAdminRoute && (
              <Button variant={navVariant("/admin/historico")} className="w-full justify-start" asChild>
                <Link to="/admin/historico">
                  <Calendar className="mr-3 h-4 w-4" />
                  Histórico
                </Link>
              </Button>
            )}
          </nav>

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

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
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
            Minhas Turmas
          </span>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Minhas Turmas
                </h1>
                <p className="text-slate-600">
                  Gerencie suas turmas e as informações dos catequizandos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Turmas */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Turmas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-col gap-2">
                      {filteredTurmas.map((turma) => (
                        <Button
                          key={turma.id}
                          variant={
                            selectedTurma.id === turma.id
                              ? "default"
                              : "outline"
                          }
                          className="justify-start text-left h-auto py-3 px-3"
                          onClick={() => {
                            setSelectedTurma(turma);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">
                              {turma.name}
                            </span>
                            <span className="text-xs opacity-75">
                              {turma.students.length} crianças
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content - Turma Details */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedTurma.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {selectedTurma.schedule}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedTurma.room}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {selectedTurma.students.length} crianças
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Search Bar */}
                    <div className="mb-6 relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar catequizando..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Students Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer text-left group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar className="h-10 w-10 mt-0.5">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                                />
                                <AvatarFallback>
                                  {student.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate group-hover:text-blue-600">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {calculateAge(student.birthDate)} anos •{" "}
                                  {student.phone}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                student.attendanceDates.percentage >= 85
                                  ? "default"
                                  : "secondary"
                              }
                              className="ml-2 whitespace-nowrap"
                            >
                              {student.attendanceDates.percentage}%
                            </Badge>
                          </div>
                        </button>
                        ))}
                          </div>

                          {filteredStudents.length === 0 && (
                            <div className="text-center py-12">
                              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500">
                                Nenhum catequizando encontrado
                              </p>
                            </div>
                          )}
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Close max-width wrapper */}
          </div>
          {/* Student Detail Modal */}
          <Dialog
            open={!!selectedStudent}
            onOpenChange={() => {
              setSelectedStudent(null);
              setDocumentPreview(null);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedStudent && !documentPreview && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.id}`}
                        />
                        <AvatarFallback>
                          {selectedStudent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-2xl">
                          {selectedStudent.name}
                        </DialogTitle>
                        <DialogDescription className="text-base mt-1">
                          {calculateAge(selectedStudent.birthDate)} anos • Nível{" "}
                          {selectedTurma.level}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <Tabs defaultValue="info" className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Informações</TabsTrigger>
                      <TabsTrigger value="documents">Documentos</TabsTrigger>
                      <TabsTrigger value="attendance">Frequência</TabsTrigger>
                    </TabsList>

                    {/* Informações Tab */}
                    <TabsContent value="info" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            Data de Nascimento
                          </label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {formatDate(selectedStudent.birthDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            CPF
                          </label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {selectedStudent.cpf}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            Telefone
                          </label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            {selectedStudent.phone}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">
                            E-mail
                          </label>
                          <p className="text-slate-900 mt-1 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            {selectedStudent.email}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Endereço
                        </label>
                        <p className="text-slate-900 mt-1 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {selectedStudent.address}
                        </p>
                      </div>
                    </TabsContent>

                    {/* Documentos Tab */}
                    <TabsContent value="documents" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        {/* Certidão de Nascimento */}
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">
                              Certidão de Nascimento
                            </span>
                            {selectedStudent.documents.birthCertificate
                              .status &&
                              selectedStudent.documents.birthCertificate
                                .uploadDate && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Enviado em{" "}
                                  {formatDate(
                                    selectedStudent.documents.birthCertificate
                                      .uploadDate
                                  )}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {selectedStudent.documents.birthCertificate
                              .status ? (
                              <>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  ✓ Enviado
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    setDocumentPreview({
                                      type: "Certidão de Nascimento",
                                      doc: selectedStudent.documents
                                        .birthCertificate,
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-red-600">
                                ✗ Pendente
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* CPF */}
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">
                              CPF
                            </span>
                            {selectedStudent.documents.cpf.status &&
                              selectedStudent.documents.cpf.uploadDate && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Enviado em{" "}
                                  {formatDate(
                                    selectedStudent.documents.cpf.uploadDate
                                  )}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {selectedStudent.documents.cpf.status ? (
                              <>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  ✓ Enviado
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    setDocumentPreview({
                                      type: "CPF",
                                      doc: selectedStudent.documents.cpf,
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-red-600">
                                ✗ Pendente
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Cartão de Vacinação */}
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">
                              Cartão de Vacinação
                            </span>
                            {selectedStudent.documents.vaccineCard.status &&
                              selectedStudent.documents.vaccineCard
                                .uploadDate && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Enviado em{" "}
                                  {formatDate(
                                    selectedStudent.documents.vaccineCard
                                      .uploadDate
                                  )}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {selectedStudent.documents.vaccineCard.status ? (
                              <>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  ✓ Enviado
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    setDocumentPreview({
                                      type: "Cartão de Vacinação",
                                      doc: selectedStudent.documents
                                        .vaccineCard,
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-red-600">
                                ✗ Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Frequência Tab */}
                    <TabsContent value="attendance" className="space-y-4 mt-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">
                            Taxa de Frequência
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            {selectedStudent.attendanceDates.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          {selectedStudent.attendanceDates.percentage >= 85
                            ? "✓ Frequência em dia"
                            : "⚠ Atenção necessária com a frequência"}
                        </p>
                        <p>
                          {selectedStudent.attendanceDates.percentage >= 90
                            ? "Excelente desempenho de frequência!"
                            : "Procure melhorar o comparecimento"}
                        </p>
                      </div>

                      {selectedStudent.attendanceDates.absenceDates.length >
                        0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-red-900 text-sm mb-2">
                                Datas de Falta:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedStudent.attendanceDates.absenceDates.map(
                                  (date, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-red-100 text-red-800 border-red-300"
                                    >
                                      {formatDate(date)}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedStudent.attendanceDates.absenceDates.length ===
                        0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm">
                            ✓ Nenhuma falta registrada
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Fechar
                    </Button>
                    <Button className="flex-1">Editar Informações</Button>
                  </div>
                </>
              )}

              {/* Document Preview */}
              {documentPreview && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between w-full">
                      <DialogTitle>{documentPreview.type}</DialogTitle>
                      <button
                        onClick={() => setDocumentPreview(null)}
                        className="rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-slate-900">
                          {documentPreview.doc.fileName ||
                            `${documentPreview.type}.pdf`}
                        </p>
                        {documentPreview.doc.uploadDate && (
                          <p className="text-xs text-slate-500 mt-1">
                            Enviado em{" "}
                            {formatDate(documentPreview.doc.uploadDate)}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Baixar
                      </Button>
                    </div>

                    <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center h-64 border-2 border-dashed border-slate-300">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 text-sm">
                          Prévia do documento
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Clique em "Baixar" para visualizar o documento
                          completo
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDocumentPreview(null)}
                      >
                        Voltar
                      </Button>
                      <Button className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Baixar Documento
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}