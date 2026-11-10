import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentSidebar } from "@/hooks/usePersistentSidebar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  AlertCircle,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cross,
  FileText,
  LogOut,
  MapPin,
  Menu,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventItem {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  dataFim: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  categoria: string;
  cor: string | null;
  recorrencia: string | null;
  tipo: "TURMA" | "GERAL";
  turma: { id: string; nome: string } | null;
}

const CATEGORIA_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ENCONTRO: { label: "Encontro", color: "text-blue-700", bg: "bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300" },
  FERIADO: { label: "Feriado", color: "text-red-700", bg: "bg-red-100 border-red-300 dark:bg-red-900/40 dark:text-red-300" },
  EVENTO: { label: "Evento", color: "text-purple-700", bg: "bg-purple-100 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300" },
  REUNIAO: { label: "Reunião", color: "text-orange-700", bg: "bg-orange-100 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300" },
  RETIRO: { label: "Retiro", color: "text-green-700", bg: "bg-green-100 border-green-300 dark:bg-green-900/40 dark:text-green-300" },
  CELEBRACAO: { label: "Celebração", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300" },
  OUTRO: { label: "Outro", color: "text-gray-700", bg: "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:text-gray-300" },
};

function getCategoriaBadge(categoria: string) {
  const config = CATEGORIA_CONFIG[categoria] ?? CATEGORIA_CONFIG.OUTRO;
  return `${config.bg} ${config.color}`;
}

function getCategoriaLabel(categoria: string) {
  return CATEGORIA_CONFIG[categoria]?.label ?? categoria;
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function ParentCronograma() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = usePersistentSidebar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_ROUTES.cronogramaEventos}?limit=1000&offset=0`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar os eventos.");
      }

      const data = await response.json();
      const list = Array.isArray(data?.eventos) ? data.eventos : [];
      setEvents(list.map((item: any): EventItem => ({
        id: String(item?.id || ""),
        titulo: String(item?.titulo || "Sem título"),
        descricao: String(item?.descricao || ""),
        data: String(item?.data || ""),
        dataFim: item?.dataFim ? String(item.dataFim) : null,
        horaInicio: item?.horaInicio ? String(item.horaInicio) : null,
        horaFim: item?.horaFim ? String(item.horaFim) : null,
        local: item?.local ? String(item.local) : null,
        categoria: String(item?.categoria || "ENCONTRO"),
        cor: item?.cor ? String(item.cor) : null,
        recorrencia: item?.recorrencia ? String(item.recorrencia) : null,
        tipo: item?.tipo === "TURMA" ? "TURMA" : "GERAL",
        turma: item?.turma ?? null,
      })));
    } catch (loadError) {
      console.error("Erro ao carregar cronograma:", loadError);
      setError("Não foi possível carregar os eventos do cronograma.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetKey = format(targetDate, "yyyy-MM-dd");

    return events.filter((event) => {
      const eventKey = format(new Date(event.data), "yyyy-MM-dd");
      return eventKey === targetKey;
    });
  };

  const currentMonthEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.data);
      return (
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [events, currentDate]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];

    return getEventsForDate(selectedDate.getDate());
  }, [selectedDate, currentDate, events]);

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => new Date(event.data) >= new Date())
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  }, [events]);

  const formatEventTime = (event: EventItem): string => {
    if (event.horaInicio) {
      return event.horaFim ? `${event.horaInicio} - ${event.horaFim}` : event.horaInicio;
    }
    return format(new Date(event.data), "HH:mm");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 lg:static lg:transform-none ${
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
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-medium">Responsável</p>
                <p className="text-sm text-muted-foreground">Cronograma</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/pais">
                <Users className="mr-3 h-4 w-4" />
                Meus Filhos
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/pais/documentos">
                <FileText className="mr-3 h-4 w-4" />
                Documentos
              </Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Calendar className="mr-3 h-4 w-4" />
              Cronograma
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/pais/galeria">
                <Camera className="mr-3 h-4 w-4" />
                Galeria
              </Link>
            </Button>
          </nav>

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
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-lg font-semibold">Cronograma</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-background dark:to-background p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Cronograma e Eventos
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Acompanhe encontros, feriados, eventos, reuniões e celebrações
                </p>
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendário */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                          </CardTitle>
                          <CardDescription>
                            Clique em um dia para ver os eventos
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousMonth}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextMonth}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Dias da semana */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                          <div
                            key={day}
                            className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Grid de Dias */}
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`empty-${i}`} className="p-2" />
                        ))}

                        {days.map((day) => {
                          const dayEvents = getEventsForDate(day);
                          const isSelected =
                            selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === currentDate.getMonth() &&
                            selectedDate.getFullYear() === currentDate.getFullYear();

                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                              className={`p-3 rounded-lg text-center text-sm font-medium transition ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card hover:bg-muted border border-border text-foreground"
                              }`}
                            >
                              <div>{day}</div>
                              {dayEvents.length > 0 && (
                                <div className="flex gap-1 mt-1 justify-center">
                                  {dayEvents.slice(0, 2).map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Eventos do Mês */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Eventos do Mês</CardTitle>
                      <CardDescription>
                        Todos os eventos agendados para {monthNames[currentDate.getMonth()]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8 text-slate-500">
                          Carregando eventos...
                        </div>
                      ) : currentMonthEvents.length > 0 ? (
                        <div className="space-y-3">
                          {currentMonthEvents
                            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                            .map((event) => (
                              <div
                                key={event.id}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                              >
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                      {event.titulo}
                                    </h4>
                                    <Badge className={`${getCategoriaBadge(event.categoria)} mt-1`} variant="outline">
                                      {getCategoriaLabel(event.categoria)}
                                    </Badge>
                                  </div>
                                  {event.tipo === "TURMA" && event.turma && (
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      {event.turma.nome}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(event.data), "dd/MM/yyyy")}
                                  </div>
                                  {event.horaInicio && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {formatEventTime(event)}
                                    </div>
                                  )}
                                  {event.local && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {event.local}
                                    </div>
                                  )}
                                </div>

                                {event.descricao && (
                                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                    {event.descricao}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-600 dark:text-slate-400">
                            Nenhum evento agendado para este mês
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Lateral de Eventos */}
                <div className="space-y-6">
                  {/* Próximos Eventos */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-4 text-sm text-slate-500">
                          Carregando...
                        </div>
                      ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-4 text-sm text-slate-500">
                          Nenhum próximo evento
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                    {event.titulo}
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {format(new Date(event.data), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <Badge className={getCategoriaBadge(event.categoria) + " text-xs"} variant="outline">
                                  {getCategoriaLabel(event.categoria)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detalhes do Dia Selecionado */}
                  {selectedDate && selectedDateEvents.length > 0 && (
                    <Card className="border-0 shadow-sm border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedDateEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-3 bg-primary/5 rounded-lg border border-primary/20"
                            >
                              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                {event.titulo}
                              </h4>
                              <Badge className={`${getCategoriaBadge(event.categoria)} mt-1`} variant="outline">
                                {getCategoriaLabel(event.categoria)}
                              </Badge>
                              {event.horaInicio && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  {formatEventTime(event)}
                                </div>
                              )}
                              {event.local && (
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                  <MapPin className="h-3 w-3" />
                                  {event.local}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Legenda de Categorias */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Categorias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(CATEGORIA_CONFIG).map(([cat, config]) => (
                          <div className="flex items-center gap-2" key={cat}>
                            <div className={`w-3 h-3 rounded border ${config.bg}`} />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {config.label}{cat !== "OUTRO" ? "s" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}