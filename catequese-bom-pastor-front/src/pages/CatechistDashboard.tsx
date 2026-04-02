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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Cross,
  DollarSign,
  Droplet,
  FileUp,
  Gift,
  GraduationCap,
  LogOut,
  MessageCircle,
  Menu,
  Music,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { getDashboardNavItems } from "@/lib/sidebarNavItems";
import { Link, useLocation } from "react-router-dom";

// Mock data
const classes = [
  {
    id: 1,
    name: "Turma A - Nível 1",
    level: 1,
    levelName: "Nível I",
    schedule: "Sábados, 9h às 11h",
    students: 15,
    room: "Sala 1",
  },
  {
    id: 2,
    name: "Turma B - Nível 2",
    level: 2,
    levelName: "Nível II",
    schedule: "Sábados, 9h às 11h",
    students: 12,
    room: "Sala 2",
  },
];

const todayStudents = [
  { id: 1, name: "Ana Carolina Souza", present: true },
  { id: 2, name: "Bruno Santos Lima", present: true },
  { id: 3, name: "Clara Oliveira", present: false },
  { id: 4, name: "Daniel Pereira", present: true },
  { id: 5, name: "Elena Maria Costa", present: true },
  { id: 6, name: "Felipe Rodrigues", present: false },
  { id: 7, name: "Gabriela Fernandes", present: true },
  { id: 8, name: "Henrique Almeida", present: true },
];

const todayTopic = {
  title: "Os Mandamentos do Amor",
  description:
    "Reflexão sobre os dois principais mandamentos: amar a Deus e ao próximo.",
  chapter: "Capítulo 12",
  objectives: [
    "Compreender o significado do amor cristão",
    "Identificar formas de praticar o amor ao próximo",
    "Memorizar os dois mandamentos principais",
  ],
};

// Lista de catequizandos com datas de aniversário e batismo (mock)
const catechumens: { id: number; name: string; birthDate: string; baptismDate?: string }[] = [
  { id: 1, name: "Ana Carolina Souza", birthDate: "2015-03-22", baptismDate: "2016-02-14" },
  { id: 2, name: "Bruno Santos Lima", birthDate: "2015-07-15", baptismDate: "2016-08-21" },
  { id: 3, name: "Clara Oliveira", birthDate: "2015-11-08", baptismDate: "2016-12-10" },
  { id: 4, name: "Daniel Pereira", birthDate: "2016-01-20", baptismDate: "2017-03-05" },
  { id: 5, name: "Elena Maria Costa", birthDate: "2015-05-10", baptismDate: "2016-06-19" },
  { id: 6, name: "Felipe Rodrigues", birthDate: "2016-02-14", baptismDate: "2017-04-02" },
  { id: 7, name: "Gabriela Fernandes", birthDate: "2015-08-30", baptismDate: "2016-10-16" },
  { id: 8, name: "Henrique Almeida", birthDate: "2016-04-03", baptismDate: "2017-05-14" },
  { id: 9, name: "Isabela Martins", birthDate: "2014-09-12", baptismDate: "2015-11-01" },
  { id: 10, name: "João Paulo Silva", birthDate: "2014-06-25", baptismDate: "2015-08-30" },
  { id: 11, name: "Karina Souza", birthDate: "2014-12-08", baptismDate: "2016-02-07" },
  { id: 12, name: "Lucas Gomes", birthDate: "2014-03-17", baptismDate: "2015-05-24" },
  { id: 13, name: "Mariana Cardoso", birthDate: "2014-07-22", baptismDate: "2015-09-20" },
  { id: 14, name: "Nicolas Ribeiro", birthDate: "2013-05-30", baptismDate: "2014-07-13" },
  { id: 15, name: "Olivia Santos", birthDate: "2013-09-14", baptismDate: "2014-11-02" },
];

export default function CatechistDashboard() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>(
    Object.fromEntries(todayStudents.map((s) => [s.id, s.present]))
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [saveAttendanceDialogOpen, setSaveAttendanceDialogOpen] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [conductPdfFile, setConductPdfFile] = useState<File | null>(null);
  const [conductPdfName, setConductPdfName] = useState<string>("");
  const [conductPdfDialogOpen, setConductPdfDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<string>("admin");
  const [messageText, setMessageText] = useState("");
  const [savedAttendances, setSavedAttendances] = useState<
    Array<{ date: string; classId: number; attendance: Record<number, boolean> }>
  >([]);
  const [messages, setMessages] = useState(
    [
      {
        id: 1,
        from: "Você",
        to: "Coordenação",
        role: "admin",
        body: "Enviei o relatório de presença da turma A.",
        date: "Hoje",
      },
      {
        id: 2,
        from: "Pai - Carlos Silva",
        to: "Você",
        role: "pai",
        body: "Poderia confirmar o horário do encontro deste sábado?",
        date: "Ontem",
      },
    ] satisfies Array<{
      id: number;
      from: string;
      to: string;
      role: "admin" | "pai" | "catequista";
      body: string;
      date: string;
    }>
  );
  
  const notifications = [
    { id: 1, type: "reminder", title: "Reunião de catequistas", message: "Amanhã às 14h na sala de reuniões", date: "Hoje" },
    { id: 2, type: "event", title: "Celebração de Natal", message: "Ensaio com as crianças dia 20/12 às 10h", date: "15/12" },
  ];
  
  const location = useLocation();
  
  // Detecta se está em rota de admin ou catequista
  const baseRoute = location.pathname.startsWith('/admin') ? '/admin' : '/catequista';
  const isAdminRoute = baseRoute === '/admin';
  
  // Aniversariantes da semana (segunda a domingo)
  const birthdaysThisWeek = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const thisYear = today.getFullYear();

    const list = catechumens
      .map((c) => {
        const original = new Date(c.birthDate);
        const thisYearBirthday = new Date(
          thisYear,
          original.getMonth(),
          original.getDate()
        );
        return { ...c, thisYearBirthday };
      })
      .filter((c) => isWithinInterval(c.thisYearBirthday, { start, end }))
      .sort(
        (a, b) => a.thisYearBirthday.getTime() - b.thisYearBirthday.getTime()
      );

    return list;
  }, []);

  // Próximos aniversários (fallback para exibição)
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const nextList = catechumens
      .map((c) => {
        const original = new Date(c.birthDate);
        let next = new Date(thisYear, original.getMonth(), original.getDate());
        if (next < today) {
          next = new Date(
            thisYear + 1,
            original.getMonth(),
            original.getDate()
          );
        }
        return { ...c, thisYearBirthday: next };
      })
      .sort(
        (a, b) => a.thisYearBirthday.getTime() - b.thisYearBirthday.getTime()
      )
      .slice(0, 5);

    return nextList;
  }, []);

  // Aniversários de batismo desta semana
  const baptismAnniversariesThisWeek = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const thisYear = today.getFullYear();

    const list = catechumens
      .filter((c) => c.baptismDate)
      .map((c) => {
        const original = new Date(c.baptismDate!);
        const thisYearAnniversary = new Date(
          thisYear,
          original.getMonth(),
          original.getDate()
        );
        return { ...c, thisYearAnniversary };
      })
      .filter((c) => isWithinInterval(c.thisYearAnniversary, { start, end }))
      .sort(
        (a, b) => a.thisYearAnniversary.getTime() - b.thisYearAnniversary.getTime()
      );

    return list;
  }, []);

  // Próximos aniversários de batismo (fallback para exibição)
  const upcomingBaptismAnniversaries = useMemo(() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const nextList = catechumens
      .filter((c) => c.baptismDate)
      .map((c) => {
        const original = new Date(c.baptismDate!);
        let next = new Date(thisYear, original.getMonth(), original.getDate());
        if (next < today) {
          next = new Date(
            thisYear + 1,
            original.getMonth(),
            original.getDate()
          );
        }
        return { ...c, thisYearAnniversary: next };
      })
      .sort(
        (a, b) => a.thisYearAnniversary.getTime() - b.thisYearAnniversary.getTime()
      )
      .slice(0, 5);

    return nextList;
  }, []);

  useEffect(() => {
    try {
      setIsAdmin((localStorage.getItem("role") || "guest") === "admin");
    } catch {}
  }, []);

  const recipientOptions = [
    { id: "admin", label: "Coordenação" },
    { id: "pais", label: "Pais da turma" },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const selected = recipientOptions.find((r) => r.id === messageRecipient);
    if (!selected) return;

    setMessages((prev) => [
      {
        id: prev.length + 1,
        from: "Você",
        to: selected.label,
        role: selected.id === "admin" ? "admin" : "pai",
        body: messageText.trim(),
        date: "Agora",
      },
      ...prev,
    ]);
    setMessageText("");
  };

  const handleConductPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setConductPdfFile(file);
      setConductPdfName(file.name);
    } else {
      alert("Por favor, selecione um arquivo PDF válido");
    }
  };

  const handleUploadConductPdf = () => {
    if (!conductPdfFile) {
      alert("Por favor, selecione um arquivo PDF");
      return;
    }
    // Aqui você implementaria o envio para o servidor
    console.log("Enviando PDF:", conductPdfFile);
    alert(`PDF "${conductPdfName}" enviado com sucesso!`);
    setConductPdfFile(null);
    setConductPdfName("");
    setConductPdfDialogOpen(false);
  };

  const getLevelColor = (level: number) => {
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

  const toggleAttendance = (studentId: number) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className={`flex min-h-screen bg-background transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } `}
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
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light">
                <GraduationCap className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="font-medium">{isAdminRoute ? 'Área do Admin' : 'Área do Catequista'}</p>
              </div>
            </div>
          </div>

          <SidebarNav items={getDashboardNavItems(isAdminRoute)} pathname={location.pathname} />

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
            Área do Catequista
          </span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Bom dia, Ana!
              </h1>
              <p className="text-muted-foreground">
                Sábado, 21 de Dezembro de 2024
              </p>
            </div>

            {/* Class Selector */}
            <div className="flex gap-2">
              {classes.map((cls) => (
                <Button
                  key={cls.id}
                  variant={selectedClass.id === cls.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
              {/* Attendance Card */}
              <div className="lg:col-span-2">
                <Card variant="default">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Lista de Chamada</CardTitle>
                        <CardDescription>
                          <Badge className={getLevelColor(selectedClass.level)}>
                            {selectedClass.levelName}
                          </Badge>
                          <span className="ml-2">{selectedClass.schedule}</span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {presentCount}/{todayStudents.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Presentes
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {todayStudents.map((student) => (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                            attendance[student.id]
                              ? "border-sage/50 bg-sage-light/30"
                              : "border-border bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={attendance[student.id]}
                              onCheckedChange={() =>
                                toggleAttendance(student.id)
                              }
                              className="h-5 w-5"
                            />
                            <span
                              className={
                                attendance[student.id]
                                  ? "font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {student.name}
                            </span>
                          </div>
                          {attendance[student.id] && (
                            <Check className="h-4 w-4 text-sage-dark" />
                          )}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="gold" 
                      className="mt-4 w-full" 
                      size="lg"
                      onClick={() => setSaveAttendanceDialogOpen(true)}
                      disabled={attendanceSaved}
                    >
                      {attendanceSaved ? "Chamada Salva" : "Salvar Chamada"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Today's Topic */}
                <Card variant="gold">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5" />
                      Tema de Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {todayTopic.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {todayTopic.chapter}
                      </p>
                    </div>
                    <p className="text-sm">{todayTopic.description}</p>
                    <div>
                      <p className="mb-2 text-sm font-medium">Objetivos:</p>
                      <ul className="space-y-1">
                        {todayTopic.objectives.map((obj, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-dark" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Conduct PDF Upload Card */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileUp className="h-5 w-5" />
                      Conduta do Catequista
                    </CardTitle>
                    <CardDescription>
                      Compartilhe o PDF sobre como se comportar e se vestir
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conductPdfName ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                          ✓ Arquivo selecionado: {conductPdfName}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center">
                        <FileUp className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Selecione um arquivo PDF para compartilhar
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleConductPdfChange}
                          className="hidden"
                        />
                        Escolher Arquivo
                      </label>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setConductPdfDialogOpen(true)}
                      disabled={!conductPdfName}
                    >
                      Compartilhar PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Weekly Birthdays */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Aniversariantes da Semana
                    </CardTitle>
                    {birthdaysThisWeek.length === 0 && (
                      <CardDescription>Próximos aniversários</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(birthdaysThisWeek.length
                      ? birthdaysThisWeek
                      : upcomingBirthdays
                    ).length > 0 ? (
                      (birthdaysThisWeek.length
                        ? birthdaysThisWeek
                        : upcomingBirthdays
                      ).map((b) => {
                        const today = new Date();
                        const todayFlag = isSameDay(b.thisYearBirthday, today);
                        const age =
                          b.thisYearBirthday.getFullYear() -
                          new Date(b.birthDate).getFullYear();
                        return (
                          <div
                            key={b.id}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                              todayFlag
                                ? "border-gold-light bg-gold-light/20"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                todayFlag ? "bg-gold-light" : "bg-primary/10"
                              }`}
                            >
                              <Gift
                                className={`h-5 w-5 ${
                                  todayFlag ? "text-gold-dark" : "text-primary"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {todayFlag ? "🎂 " : ""}
                                {b.name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <Badge variant="outline">
                                  {format(
                                    b.thisYearBirthday,
                                    "EEE, dd 'de' MMMM",
                                    { locale: ptBR }
                                  )}
                                </Badge>
                                <Badge className="bg-sage-light text-sage-dark hover:bg-sage-light">
                                  {age} anos
                                </Badge>
                                {todayFlag && (
                                  <Badge className="bg-gold-light text-gold-dark hover:bg-gold-light">
                                    Hoje
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                        Nenhum aniversariante nesta semana.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Baptism Anniversaries */}
                <Card variant="default">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Aniversários de Batismo
                    </CardTitle>
                    {baptismAnniversariesThisWeek.length === 0 && (
                      <CardDescription>Próximos aniversários de batismo</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(baptismAnniversariesThisWeek.length
                      ? baptismAnniversariesThisWeek
                      : upcomingBaptismAnniversaries
                    ).length > 0 ? (
                      (baptismAnniversariesThisWeek.length
                        ? baptismAnniversariesThisWeek
                        : upcomingBaptismAnniversaries
                      ).map((b) => {
                        const today = new Date();
                        const todayFlag = isSameDay(b.thisYearAnniversary, today);
                        const yearsAgo =
                          b.thisYearAnniversary.getFullYear() -
                          new Date(b.baptismDate!).getFullYear();
                        return (
                          <div
                            key={`baptism-${b.id}`}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                              todayFlag
                                ? "border-blue-light bg-blue-light/20"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                todayFlag ? "bg-blue-400" : "bg-blue-100"
                              }`}
                            >
                              <Droplet
                                className={`h-5 w-5 ${
                                  todayFlag ? "text-white" : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {todayFlag ? "💧 " : ""}
                                {b.name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <Badge variant="outline">
                                  {format(
                                    b.thisYearAnniversary,
                                    "EEE, dd 'de' MMMM",
                                    { locale: ptBR }
                                  )}
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                  {yearsAgo} ano{yearsAgo !== 1 ? 's' : ''} de batismo
                                </Badge>
                                {todayFlag && (
                                  <Badge className="bg-blue-400 text-white hover:bg-blue-400">
                                    Hoje
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                        Nenhum aniversário de batismo nesta semana.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
        </main>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <Bell className="h-5 w-5 text-gold-dark" />
              </div>
              Notificações
            </DialogTitle>
            <DialogDescription className="text-base">
              Acompanhe todas as notificações e avisos importantes
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.id} className="border-2 hover:border-primary/40 transition-colors">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base mb-1">{notif.title}</p>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.date}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhuma notificação</p>
                <p className="text-sm text-muted-foreground mt-1">Você está em dia!</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={communicationOpen} onOpenChange={setCommunicationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              Comunicação
            </DialogTitle>
            <DialogDescription className="text-base">
              Envie mensagens para a coordenação ou pais da turma e acompanhe o histórico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Destinatário</label>
              <Select value={messageRecipient} onValueChange={setMessageRecipient}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Destinatário" />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Mensagem</label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-[140px] resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setHistoryOpen(true)}
                className="flex-1 mr-3"
              >
                <Clock className="mr-2 h-4 w-4" />
                Ver Histórico
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
                )}
              </Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} size="lg" className="min-w-[120px]">
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                <Bell className="h-5 w-5 text-gold-dark" />
              </div>
              Notificações
            </DialogTitle>
            <DialogDescription className="text-base">
              Acompanhe todas as notificações e avisos importantes
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Card key={notif.id} className="border-2 hover:border-primary/40 transition-colors">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base mb-1">{notif.title}</p>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.date}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhuma notificação</p>
                <p className="text-sm text-muted-foreground mt-1">Você está em dia!</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Message History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              Histórico de Mensagens
            </DialogTitle>
            <DialogDescription className="text-base">
              Acompanhe todas as conversas com coordenação e pais
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(85vh-180px)] pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MessageCircle className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-base font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-sm">Suas conversas aparecerão aqui</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{msg.from}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span>{msg.to}</span>
                      </div>
                      <Badge variant={msg.role === "admin" ? "outline" : msg.role === "pai" ? "secondary" : "default"} className="text-xs">
                        {msg.role === "admin" ? "Coordenação" : msg.role === "pai" ? "Pais" : "Catequista"}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{msg.body}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{msg.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gold shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:bg-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/50"
            aria-label="Abrir notificações"
          >
            <Bell className="h-7 w-7 text-white" />
          </button>
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 border-2 border-background text-xs font-bold">
              {notifications.length}
            </Badge>
          )}
        </div>
        {/* Communication Button */}
        <button
          onClick={() => setCommunicationOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/50"
          aria-label="Abrir mensagens"
        >
          <MessageCircle className="h-7 w-7 text-primary-foreground" />
        </button>
      </div>

      {/* Save Attendance Confirmation Dialog */}
      <Dialog open={saveAttendanceDialogOpen} onOpenChange={setSaveAttendanceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Salvar Chamada</DialogTitle>
                <DialogDescription>
                  Confirmação importante
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">
                ⚠️ Aviso importante
              </p>
              <p className="text-sm text-amber-800">
                Após salvar a chamada, <strong>não será possível alterar</strong> os registros de presença e ausência desta data. Esta ação é irreversível.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Data:</strong> {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>Presentes:</strong> {presentCount}/{todayStudents.length} catequizandos
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setSaveAttendanceDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                setSavedAttendances([
                  ...savedAttendances,
                  {
                    date: format(new Date(), "yyyy-MM-dd"),
                    classId: selectedClass.id,
                    attendance: { ...attendance }
                  }
                ]);
                setAttendanceSaved(true);
                setSaveAttendanceDialogOpen(false);
              }}
            >
              Confirmar e Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conduct PDF Upload Dialog */}
      <Dialog open={conductPdfDialogOpen} onOpenChange={setConductPdfDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Compartilhar PDF</DialogTitle>
                <DialogDescription>
                  Conduta do Catequista
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">
                ✓ Arquivo selecionado
              </p>
              <p className="text-sm text-blue-800 font-mono break-all">
                {conductPdfName}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-700">
                Este PDF será compartilhado com a coordenação e estará disponível no sistema para referência sobre as condutas esperadas do catequista.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setConductPdfDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="default"
              onClick={handleUploadConductPdf}
            >
              Confirmar Envio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}