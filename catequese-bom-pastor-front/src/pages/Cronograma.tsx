import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  compareAsc,
  endOfMonth,
  format,
  getDaysInMonth,
  getDaysInYear,
  isSameMonth,
  isSameYear,
  parseISO,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Calendar as CalendarNav,
  ClipboardList,
  Cross,
  DollarSign,
  LogOut,
  Menu,
  Music,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { Link, useLocation } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description?: string;
}

type Schedule = Record<string, Lesson[]>; // key: yyyy-MM-dd

const STORAGE_KEY = "cronograma_schedule";

export default function Cronograma() {
  const [date, setDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<Schedule>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("month");
  const [editing, setEditing] = useState<{
    mode: "add" | "edit";
    lesson?: Lesson;
  } | null>(null);
  const [form, setForm] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const location = useLocation();

  useEffect(() => {
    try {
      setIsAdmin((localStorage.getItem("role") || "guest") === "admin");
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSchedule(JSON.parse(raw));
      else seedDemo();
    } catch {}
  }, []);

  const selectedKey = useMemo(() => format(date, "yyyy-MM-dd"), [date]);
  const lessonsForDay = schedule[selectedKey] || [];

  function persist(next: Schedule) {
    setSchedule(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function seedDemo() {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const nextSat = nextWeekday(new Date(), 6);
    const nextSatKey = format(nextSat, "yyyy-MM-dd");
    const demo: Schedule = {
      [todayKey]: [
        {
          id: cryptoId(),
          title: "Boas-vindas e oração inicial",
          description: "Acolhida das crianças",
        },
        {
          id: cryptoId(),
          title: "Tema: Os Mandamentos do Amor",
          description: "Cap. 12 – dinâmica em grupos",
        },
      ],
      [nextSatKey]: [
        {
          id: cryptoId(),
          title: "Leitura: Parábola do Semeador",
          description: "Mt 13,1-23",
        },
      ],
    };
    persist(demo);
  }

  function cryptoId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function nextWeekday(from: Date, weekday: number) {
    const d = new Date(from);
    d.setDate(d.getDate() + ((7 + weekday - d.getDay()) % 7 || 7));
    return d;
  }

  function startAdd() {
    setEditing({ mode: "add" });
    setForm({ title: "", description: "" });
  }

  function startEdit(lesson: Lesson) {
    setEditing({ mode: "edit", lesson });
    setForm({ title: lesson.title, description: lesson.description || "" });
  }

  function saveForm() {
    if (!form.title.trim()) return;
    const key = selectedKey;
    const list = schedule[key] ? [...schedule[key]] : [];
    if (editing?.mode === "add") {
      list.push({
        id: cryptoId(),
        title: form.title.trim(),
        description: form.description.trim(),
      });
    } else if (editing?.mode === "edit" && editing.lesson) {
      const idx = list.findIndex((l) => l.id === editing.lesson!.id);
      if (idx >= 0)
        list[idx] = {
          ...list[idx],
          title: form.title.trim(),
          description: form.description.trim(),
        };
    }
    persist({ ...schedule, [key]: list });
    setEditing(null);
  }

  function deleteLesson(id: string, keyOverride?: string) {
    const key = keyOverride || selectedKey;
    const list = (schedule[key] || []).filter((l) => l.id !== id);
    const next = { ...schedule };
    if (list.length) next[key] = list;
    else delete next[key];
    persist(next);
  }

  const monthRange = useMemo(
    () => ({ start: startOfMonth(date), end: endOfMonth(date) }),
    [date]
  );

  const monthKeys = useMemo(() => {
    return Object.keys(schedule)
      .filter((key) => isSameMonth(parseISO(key), date))
      .sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
  }, [schedule, date]);

  const yearKeys = useMemo(() => {
    return Object.keys(schedule)
      .filter((key) => isSameYear(parseISO(key), date))
      .sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
  }, [schedule, date]);

  const yearGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    yearKeys.forEach((k) => {
      const monthLabel = format(parseISO(k), "MMMM", { locale: ptBR });
      if (!grouped[monthLabel]) grouped[monthLabel] = [];
      grouped[monthLabel].push(k);
    });
    Object.keys(grouped).forEach((m) =>
      grouped[m].sort((a, b) => compareAsc(parseISO(a), parseISO(b)))
    );
    return grouped;
  }, [yearKeys]);

  const coverage = useMemo(() => {
    if (viewMode === "year") {
      const total = getDaysInYear(date);
      const covered = yearKeys.length;
      return { covered, total, percent: Math.round((covered / total) * 100) };
    }
    if (viewMode === "month") {
      const total = getDaysInMonth(date);
      const covered = monthKeys.length;
      return { covered, total, percent: Math.round((covered / total) * 100) };
    }
    const total = 1;
    const covered = lessonsForDay.length > 0 ? 1 : 0;
    return { covered, total, percent: covered * 100 };
  }, [viewMode, date, yearKeys.length, monthKeys.length, lessonsForDay.length]);

  // Detecta se está em rota de admin ou catequista
  const baseRoute = location.pathname.startsWith('/admin') ? '/admin' : '/catequista';
  const isAdminRoute = baseRoute === '/admin';

  const navVariant = (path: string) =>
    location.pathname === path ? "navActive" : "nav";

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
                <CalendarNav className="h-5 w-5 text-gold-dark" />
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
                Minhas Turmas
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
          <span className="font-display text-lg font-semibold">Cronograma</span>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900">Cronograma</h1>
              <p className="text-slate-600">
                Veja e organize os conteúdos previstos por dia
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "day", label: "Dia" },
                    { key: "month", label: "Mês" },
                    { key: "year", label: "Ano" },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.key}
                    variant={viewMode === opt.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode(opt.key)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              <div className="w-full max-w-xl">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>
                    {viewMode === "year"
                      ? "Cobertura do ano"
                      : viewMode === "month"
                      ? "Cobertura do mês"
                      : "Conteúdos do dia"}
                  </span>
                  <span>
                    {coverage.covered}/{coverage.total} ({coverage.percent}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${coverage.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" /> Cronograma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    className="rounded-md border"
                  />
                  <CardDescription className="mt-3">
                    Selecionado:{" "}
                    {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className={`lg:col-span-2 ${
                  viewMode === "day" ? "" : "opacity-70"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Conteúdos do dia</CardTitle>
                      <CardDescription>
                        {lessonsForDay.length} item(s) para{" "}
                        {format(date, "dd/MM/yyyy")}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <Button onClick={startAdd} className="gap-2">
                        <Plus className="h-4 w-4" /> Adicionar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {lessonsForDay.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum conteúdo cadastrado para este dia.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lessonsForDay.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-start justify-between rounded-lg border p-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Aula</Badge>
                              <p className="font-medium text-slate-900">
                                {l.title}
                              </p>
                            </div>
                            {l.description && (
                              <p className="mt-1 text-sm text-slate-600">
                                {l.description}
                              </p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="ml-3 flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => startEdit(l)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() => deleteLesson(l.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && editing && (
                    <div className="mt-6 rounded-lg border p-4">
                      <p className="mb-3 font-medium">
                        {editing.mode === "add"
                          ? "Adicionar conteúdo"
                          : "Editar conteúdo"}
                      </p>
                      <div className="grid gap-3">
                        <Input
                          placeholder="Título"
                          value={form.title}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, title: e.target.value }))
                          }
                        />
                        <Textarea
                          placeholder="Descrição (opcional)"
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                        />
                        <div className="flex gap-2">
                          <Button onClick={saveForm} className="gap-2">
                            {editing.mode === "add" ? "Salvar" : "Atualizar"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditing(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`lg:col-span-3 ${
                  viewMode === "month" ? "" : "opacity-80"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Encontros do mês</CardTitle>
                      <CardDescription>
                        {format(monthRange.start, "MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {monthKeys.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum encontro cadastrado neste mês.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {monthKeys.map((key) => (
                        <div key={key} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-slate-700"
                              >
                                {format(parseISO(key), "EEEE, dd 'de' MMMM", {
                                  locale: ptBR,
                                })}
                              </Badge>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDate(parseISO(key));
                                  setEditing({ mode: "add" });
                                  setForm({ title: "", description: "" });
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Adicionar para
                                o dia
                              </Button>
                            )}
                          </div>

                          {(schedule[key] || []).length === 0 ? (
                            <div className="rounded-md border border-dashed p-4 text-sm text-slate-500">
                              Sem conteúdos para este dia.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(schedule[key] || []).map((l) => (
                                <div
                                  key={l.id}
                                  className="flex items-start justify-between rounded-lg border p-3"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Aula</Badge>
                                      <p className="font-medium text-slate-900">
                                        {l.title}
                                      </p>
                                    </div>
                                    {l.description && (
                                      <p className="mt-1 text-sm text-slate-600">
                                        {l.description}
                                      </p>
                                    )}
                                  </div>
                                  {isAdmin && (
                                    <div className="ml-3 flex gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          setDate(parseISO(key));
                                          startEdit(l);
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8"
                                        onClick={() => deleteLesson(l.id, key)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`lg:col-span-3 ${
                  viewMode === "year" ? "" : "opacity-90"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Encontros do ano</CardTitle>
                      <CardDescription>
                        {format(startOfYear(date), "yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {yearKeys.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum encontro cadastrado neste ano.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(yearGrouped).map(([monthLabel, keys]) => (
                        <div key={monthLabel} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-slate-700 capitalize"
                            >
                              {monthLabel}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {keys.length} dia(s)
                            </span>
                          </div>

                          {keys.map((key) => (
                            <div
                              key={key}
                              className="mt-3 rounded-md border p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-slate-700"
                                  >
                                    {format(
                                      parseISO(key),
                                      "EEEE, dd 'de' MMMM",
                                      { locale: ptBR }
                                    )}
                                  </Badge>
                                </div>
                                {isAdmin && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setDate(parseISO(key));
                                        setEditing({ mode: "add" });
                                        setForm({ title: "", description: "" });
                                      }}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />{" "}
                                      Adicionar para o dia
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {(schedule[key] || []).length === 0 ? (
                                <div className="rounded-md border border-dashed p-3 text-sm text-slate-500">
                                  Sem conteúdos para este dia.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {(schedule[key] || []).map((l) => (
                                    <div
                                      key={l.id}
                                      className="flex items-start justify-between rounded-lg border p-3"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">Aula</Badge>
                                          <p className="font-medium text-slate-900">
                                            {l.title}
                                          </p>
                                        </div>
                                        {l.description && (
                                          <p className="mt-1 text-sm text-slate-600">
                                            {l.description}
                                          </p>
                                        )}
                                      </div>
                                      {isAdmin && (
                                        <div className="ml-3 flex gap-2">
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8"
                                            onClick={() => {
                                              setDate(parseISO(key));
                                              startEdit(l);
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8"
                                            onClick={() =>
                                              deleteLesson(l.id, key)
                                            }
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}