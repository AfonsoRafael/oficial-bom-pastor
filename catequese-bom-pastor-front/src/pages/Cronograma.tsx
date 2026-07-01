import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { getDashboardNavItems } from "@/lib/sidebarNavItems";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Calendar as CalendarNav,
  Clock,
  Cross,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Users,
} from "lucide-react";

type ViewMode = "day" | "month" | "year";

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "TURMA" | "GERAL";
  turmaName: string | null;
}

interface EventForm {
  title: string;
  description: string;
  audience: "comunidade" | "pais-catequistas";
}

function normalizeRole(value: string | null): "admin" | "catequista" | "responsavel" | "guest" {
  const role = String(value || "").toLowerCase().trim();

  if (role === "admin" || role === "administrador" || role === "adminstrador") {
    return "admin";
  }

  if (role === "catequista" || role === "catechist") {
    return "catequista";
  }

  if (role === "responsavel" || role === "responsável" || role === "parent") {
    return "responsavel";
  }

  return "guest";
}

function toDateKey(dateIso: string): string {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return format(parsed, "yyyy-MM-dd");
}

function mapEvent(item: any): EventItem {
  return {
    id: String(item?.id || ""),
    title: String(item?.titulo || "Sem título"),
    description: String(item?.descricao || ""),
    date: String(item?.data || ""),
    type: item?.tipo === "TURMA" ? "TURMA" : "GERAL",
    turmaName: item?.turma?.nome ? String(item.turma.nome) : null,
  };
}

export default function Cronograma() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const location = useLocation();

  const baseRoute = location.pathname.startsWith("/admin") ? "/admin" : "/catequista";
  const isAdminRoute = baseRoute === "/admin";

  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    audience: "comunidade",
  });
  const canManageEvents = isAdminRoute && isAdmin;

  useEffect(() => {
    const role = normalizeRole(localStorage.getItem("userRole"));
    setIsAdmin(role === "admin");
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_ROUTES.cronogramaEventos}?limit=1000&offset=0`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar os eventos.");
      }

      const data = await response.json();
      const list = Array.isArray(data?.eventos) ? data.eventos : [];
      setEvents(list.map(mapEvent));
    } catch (loadError) {
      console.error("Erro ao carregar cronograma:", loadError);
      setError("Não foi possível carregar os eventos do cronograma.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const eventKeys = useMemo(() => {
    return new Set(events.map((event) => toDateKey(event.date)).filter(Boolean));
  }, [events]);

  const selectedKey = useMemo(() => format(date, "yyyy-MM-dd"), [date]);

  const eventsForDay = useMemo(() => {
    return events
      .filter((event) => toDateKey(event.date) === selectedKey)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, selectedKey]);

  const monthEvents = useMemo(() => {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    return events
      .filter((event) => {
        const parsed = new Date(event.date);
        return parsed.getMonth() === targetMonth && parsed.getFullYear() === targetYear;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [date, events]);

  const yearEvents = useMemo(() => {
    const targetYear = date.getFullYear();

    return events
      .filter((event) => new Date(event.date).getFullYear() === targetYear)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [date, events]);

  const groupedYearEvents = useMemo(() => {
    const grouped: Record<string, EventItem[]> = {};

    for (const event of yearEvents) {
      const parsed = new Date(event.date);
      const monthLabel = format(parsed, "MMMM", { locale: ptBR });
      if (!grouped[monthLabel]) {
        grouped[monthLabel] = [];
      }
      grouped[monthLabel].push(event);
    }

    return grouped;
  }, [yearEvents]);

  const coverage = useMemo(() => {
    if (viewMode === "year") {
      const coveredDays = new Set(yearEvents.map((event) => toDateKey(event.date))).size;
      return {
        covered: coveredDays,
        total: 365,
        percent: Math.min(100, Math.round((coveredDays / 365) * 100)),
      };
    }

    if (viewMode === "month") {
      const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const coveredDays = new Set(monthEvents.map((event) => toDateKey(event.date))).size;
      return {
        covered: coveredDays,
        total: totalDays,
        percent: Math.min(100, Math.round((coveredDays / totalDays) * 100)),
      };
    }

    const covered = eventsForDay.length > 0 ? 1 : 0;
    return {
      covered,
      total: 1,
      percent: covered * 100,
    };
  }, [date, eventsForDay.length, monthEvents, viewMode, yearEvents]);

  const createEvent = async () => {
    if (!form.title.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth(API_ROUTES.cronogramaEventos, {
        method: "POST",
        body: JSON.stringify({
          titulo: form.title.trim(),
          descricao: form.description.trim() || undefined,
          data: date.toISOString(),
          tipo: form.audience === "comunidade" ? "GERAL" : "TURMA",
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar evento.");
      }

      setForm({ title: "", description: "", audience: "comunidade" });
      setShowCreateForm(false);
      await loadEvents();
    } catch (submitError) {
      console.error("Erro ao criar evento:", submitError);
      setError("Não foi possível criar o evento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen bg-background transition-[padding] duration-300 ${
        sidebarOpen ? "lg:pl-64" : "lg:pl-0"
      }`}
    >
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
              <span className="font-display text-lg font-semibold">Catequese</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light">
                <CalendarNav className="h-5 w-5 text-gold-dark" />
              </div>
              <div>
                <p className="font-medium">
                  {isAdminRoute ? "Área do Admin" : "Área do Catequista"}
                </p>
              </div>
            </div>
          </div>

          <SidebarNav items={getDashboardNavItems(isAdminRoute)} pathname={location.pathname} />

          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start text-destructive" asChild>
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
              <p className="text-slate-600">Veja os eventos e acompanhe as datas importantes</p>
            </div>

            {error && (
              <Card className="mb-6 border-red-200">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      : "Eventos do dia"}
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
                    onSelect={(selected) => selected && setDate(selected)}
                    className="rounded-md border"
                    modifiers={{
                      withEvents: (d) => eventKeys.has(format(d, "yyyy-MM-dd")),
                    }}
                    modifiersClassNames={{
                      withEvents: "bg-primary/15 font-semibold text-primary",
                    }}
                  />
                  <CardDescription className="mt-3">
                    Selecionado: {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className={`lg:col-span-2 ${viewMode === "day" ? "" : "opacity-90"}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Eventos do dia</CardTitle>
                      <CardDescription>
                        {eventsForDay.length} item(s) para {format(date, "dd/MM/yyyy")}
                      </CardDescription>
                    </div>
                    {canManageEvents && (
                      <Button onClick={() => setShowCreateForm((prev) => !prev)} className="gap-2">
                        <Plus className="h-4 w-4" /> Adicionar evento
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Carregando eventos...
                    </div>
                  ) : eventsForDay.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum evento cadastrado para este dia.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventsForDay.map((event) => (
                        <div key={event.id} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {event.type === "GERAL" ? "Comunidade" : "Pais e Catequistas"}
                            </Badge>
                            {event.turmaName && <Badge>{event.turmaName}</Badge>}
                            <p className="font-medium text-slate-900">{event.title}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(event.date), "HH:mm")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.type === "GERAL"
                                ? "Visível na comunidade"
                                : "Visível para pais e catequistas"}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-slate-700">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {canManageEvents && showCreateForm && (
                    <div className="mt-6 rounded-lg border p-4">
                      <p className="mb-3 font-medium">
                        Novo evento para {format(date, "dd/MM/yyyy")}
                      </p>
                      <div className="grid gap-3">
                        <Input
                          placeholder="Título do evento"
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Descrição (opcional)"
                          value={form.description}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                        <Select
                          value={form.audience}
                          onValueChange={(value: "comunidade" | "pais-catequistas") =>
                            setForm((prev) => ({ ...prev, audience: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a visibilidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comunidade">
                              Comunidade (aparece na página Início)
                            </SelectItem>
                            <SelectItem value="pais-catequistas">
                              Apenas pais e catequistas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button onClick={createEvent} disabled={submitting}>
                            {submitting ? "Salvando..." : "Salvar evento"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCreateForm(false);
                              setForm({
                                title: "",
                                description: "",
                                audience: "comunidade",
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`lg:col-span-3 ${viewMode === "month" ? "" : "opacity-90"}`}>
                <CardHeader>
                  <CardTitle>Eventos do mês</CardTitle>
                  <CardDescription>
                    {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Carregando eventos...
                    </div>
                  ) : monthEvents.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum evento cadastrado neste mês.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monthEvents.map((event) => (
                        <div key={event.id} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {format(new Date(event.date), "EEEE, dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </Badge>
                            <Badge variant="secondary">
                              {event.type === "GERAL" ? "Comunidade" : "Pais e Catequistas"}
                            </Badge>
                            <p className="font-medium text-slate-900">{event.title}</p>
                          </div>
                          {event.description && (
                            <p className="mt-1 text-sm text-slate-700">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`lg:col-span-3 ${viewMode === "year" ? "" : "opacity-90"}`}>
                <CardHeader>
                  <CardTitle>Eventos do ano</CardTitle>
                  <CardDescription>{format(date, "yyyy")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Carregando eventos...
                    </div>
                  ) : yearEvents.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      Nenhum evento cadastrado neste ano.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedYearEvents).map(([month, monthItems]) => (
                        <div key={month} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {month}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {monthItems.length} evento(s)
                            </span>
                          </div>
                          <div className="space-y-3">
                            {monthItems.map((event) => (
                              <div key={event.id} className="rounded-md border p-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {format(new Date(event.date), "dd/MM/yyyy")}
                                  </Badge>
                                  <Badge variant="outline">
                                    {event.type === "GERAL"
                                      ? "Comunidade"
                                      : "Pais e Catequistas"}
                                  </Badge>
                                  <p className="font-medium text-slate-900">{event.title}</p>
                                </div>
                                {event.description && (
                                  <p className="mt-1 text-sm text-slate-700">{event.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
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
