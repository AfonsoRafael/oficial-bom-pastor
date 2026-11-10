import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatusMatricula = "PENDENTE" | "EM_ANALISE" | "PENDENCIA_DOCUMENTAL" | "APROVADA" | "REJEITADA";

interface MatriculaMock {
  protocolo: string;
  dataSolicitacao: string;
  status: StatusMatricula;
  nivel: "Nível I" | "Nível II" | "Nível III";
  responsavel: {
    nome: string;
    cpf: string;
    telefone: string;
    whatsapp: string;
    email: string;
    parentesco: string;
  };
  catequizando: {
    nome: string;
    nascimento: string;
    endereco: string;
    telefoneEmergencia: string;
  };
  documentosEnviados: string[];
  parecerSecretaria: string;
  observacoes: string;
}

const statusConfig: Record<StatusMatricula, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "border-transparent bg-gray-100 text-gray-800" },
  EM_ANALISE: { label: "Em análise", className: "border-transparent bg-blue-100 text-blue-800" },
  PENDENCIA_DOCUMENTAL: { label: "Pendência documental", className: "border-transparent bg-amber-100 text-amber-800" },
  APROVADA: { label: "Aprovada", className: "border-transparent bg-green-100 text-green-800" },
  REJEITADA: { label: "Rejeitada", className: "border-transparent bg-red-100 text-red-800" },
};

const documentosObrigatorios = [
  "Certidão de Nascimento",
  "Certificado de Batismo",
  "Comprovante de Residência",
  "Documento do Responsável",
];

const turmas = ["Turma Nível I - Domingo", "Turma Nível II - Sábado", "Turma Nível III - Domingo"];

// Dados fictícios apenas para demonstração.
const matriculasMock: MatriculaMock[] = [
  {
    protocolo: "MAT-2025-0002",
    dataSolicitacao: "2025-02-05",
    status: "EM_ANALISE",
    nivel: "Nível II",
    responsavel: { nome: "Responsável Exemplo B", cpf: "000.000.000-00", telefone: "(00) 0000-0002", whatsapp: "(00) 90000-0002", email: "exemplo.b@exemplo.invalid", parentesco: "Pai" },
    catequizando: { nome: "Catequizando Exemplo B", nascimento: "2014-08-01", endereco: "Av. Fictícia, 200 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1002" },
    documentosEnviados: documentosObrigatorios,
    parecerSecretaria: "Documentação conferida. Recomenda aprovação.",
    observacoes: "Alergia a amendoim.",
  },
  {
    protocolo: "MAT-2025-0003",
    dataSolicitacao: "2025-02-07",
    status: "PENDENCIA_DOCUMENTAL",
    nivel: "Nível III",
    responsavel: { nome: "Responsável Exemplo C", cpf: "000.000.000-00", telefone: "(00) 0000-0003", whatsapp: "(00) 90000-0003", email: "exemplo.c@exemplo.invalid", parentesco: "Avó" },
    catequizando: { nome: "Catequizando Exemplo C", nascimento: "2012-06-25", endereco: "Travessa Fictícia, 300 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1003" },
    documentosEnviados: ["Certidão de Nascimento", "Documento do Responsável"],
    parecerSecretaria: "Falta o certificado de batismo e o comprovante de residência.",
    observacoes: "",
  },
  {
    protocolo: "MAT-2025-0001",
    dataSolicitacao: "2025-02-03",
    status: "PENDENTE",
    nivel: "Nível I",
    responsavel: { nome: "Responsável Exemplo A", cpf: "000.000.000-00", telefone: "(00) 0000-0001", whatsapp: "(00) 90000-0001", email: "exemplo.a@exemplo.invalid", parentesco: "Mãe" },
    catequizando: { nome: "Catequizando Exemplo A", nascimento: "2016-03-12", endereco: "Rua Fictícia, 100 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1001" },
    documentosEnviados: documentosObrigatorios,
    parecerSecretaria: "",
    observacoes: "",
  },
  {
    protocolo: "MAT-2025-0004",
    dataSolicitacao: "2025-02-10",
    status: "APROVADA",
    nivel: "Nível I",
    responsavel: { nome: "Responsável Exemplo D", cpf: "000.000.000-00", telefone: "(00) 0000-0004", whatsapp: "(00) 90000-0004", email: "exemplo.d@exemplo.invalid", parentesco: "Mãe" },
    catequizando: { nome: "Catequizando Exemplo D", nascimento: "2016-12-02", endereco: "Rua Fictícia, 400 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1004" },
    documentosEnviados: documentosObrigatorios,
    parecerSecretaria: "Documentos completos.",
    observacoes: "",
  },
  {
    protocolo: "MAT-2025-0005",
    dataSolicitacao: "2025-02-12",
    status: "REJEITADA",
    nivel: "Nível II",
    responsavel: { nome: "Responsável Exemplo E", cpf: "000.000.000-00", telefone: "(00) 0000-0005", whatsapp: "(00) 90000-0005", email: "exemplo.e@exemplo.invalid", parentesco: "Tio" },
    catequizando: { nome: "Catequizando Exemplo E", nascimento: "2018-07-19", endereco: "Rua Fictícia, 500 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1005" },
    documentosEnviados: ["Documento do Responsável"],
    parecerSecretaria: "Idade incompatível com o nível solicitado.",
    observacoes: "",
  },
];

const formatarData = (iso: string) => {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
};

const StatusBadge = ({ status }: { status: StatusMatricula }) => (
  <Badge className={cn("whitespace-nowrap", statusConfig[status].className)}>{statusConfig[status].label}</Badge>
);

const Dado = ({ label, valor }: { label: string; valor: string }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="break-words text-sm font-medium">{valor || "—"}</dd>
  </div>
);

export default function CoordenadorMatriculasPage() {
  const { toast } = useToast();
  const [selecionada, setSelecionada] = useState<MatriculaMock | null>(null);
  const [turma, setTurma] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | StatusMatricula>("TODOS");
  const [busca, setBusca] = useState("");

  const contagem = (s: StatusMatricula) => matriculasMock.filter((m) => m.status === s).length;

  const indicadores: { titulo: string; valor: number }[] = [
    { titulo: "Matrículas Pendentes", valor: contagem("PENDENTE") },
    { titulo: "Em Análise", valor: contagem("EM_ANALISE") },
    { titulo: "Pendência Documental", valor: contagem("PENDENCIA_DOCUMENTAL") },
    { titulo: "Aprovadas", valor: contagem("APROVADA") },
  ];

  const matriculasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return matriculasMock
      .filter((m) => filtroStatus === "TODOS" || m.status === filtroStatus)
      .filter(
        (m) =>
          !termo ||
          m.protocolo.toLowerCase().includes(termo) ||
          m.responsavel.nome.toLowerCase().includes(termo) ||
          m.catequizando.nome.toLowerCase().includes(termo),
      )
      .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
  }, [busca, filtroStatus]);

  const abrir = (m: MatriculaMock) => {
    setSelecionada(m);
    setTurma("");
  };

  const simular = (title: string) => {
    toast({ title, description: "Nada foi salvo: esta tela usa apenas dados de demonstração." });
  };

  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-background via-muted/30 to-sage-light/20 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Aprovação de Matrículas</h1>
            <p className="text-muted-foreground">Área do Coordenador — decisão final sobre as matrículas analisadas.</p>
          </div>

          <p role="note" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Demonstração: os dados abaixo são fictícios e nenhuma decisão é enviada ou salva.
          </p>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {indicadores.map((i) => (
              <Card key={i.titulo} variant="elevated">
                <CardHeader className="pb-2">
                  <CardDescription>{i.titulo}</CardDescription>
                  <CardTitle className="font-display text-3xl">{i.valor}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Matrículas</CardTitle>
              <CardDescription>
                {matriculasFiltradas.length} de {matriculasMock.length} matrículas de exemplo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por protocolo, responsável ou catequizando"
                    aria-label="Buscar matrículas"
                    className="pl-9"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as "TODOS" | StatusMatricula)}>
                  <SelectTrigger className="sm:w-56" aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                    <SelectItem value="PENDENCIA_DOCUMENTAL">Pendência Documental</SelectItem>
                    <SelectItem value="APROVADA">Aprovada</SelectItem>
                    <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Catequizando</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parecer Secretaria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        Nenhuma matrícula encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {matriculasFiltradas.map((m) => (
                    <TableRow key={m.protocolo}>
                      <TableCell className="whitespace-nowrap font-mono font-semibold">{m.protocolo}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.responsavel.nome}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.catequizando.nome}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.nivel}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatarData(m.dataSolicitacao)}</TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                      <TableCell className="min-w-[200px] max-w-[260px] truncate" title={m.parecerSecretaria}>
                        {m.parecerSecretaria || "Sem parecer"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => abrir(m)}>Visualizar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={!!selecionada} onOpenChange={(aberto) => !aberto && setSelecionada(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selecionada && (
            <>
              <DialogHeader>
                <DialogTitle>Matrícula {selecionada.protocolo}</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selecionada.status} />
                    <span>{selecionada.nivel} • {formatarData(selecionada.dataSolicitacao)}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <section className="space-y-2">
                <h3 className="font-display font-semibold">Dados do Responsável</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Dado label="Nome" valor={selecionada.responsavel.nome} />
                  <Dado label="CPF" valor={selecionada.responsavel.cpf} />
                  <Dado label="Parentesco" valor={selecionada.responsavel.parentesco} />
                  <Dado label="Telefone" valor={selecionada.responsavel.telefone} />
                  <Dado label="WhatsApp" valor={selecionada.responsavel.whatsapp} />
                  <Dado label="E-mail" valor={selecionada.responsavel.email} />
                </dl>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-semibold">Dados do Catequizando</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Dado label="Nome" valor={selecionada.catequizando.nome} />
                  <Dado label="Nascimento" valor={formatarData(selecionada.catequizando.nascimento)} />
                  <Dado label="Nível" valor={selecionada.nivel} />
                  <Dado label="Telefone de emergência" valor={selecionada.catequizando.telefoneEmergencia} />
                  <div className="sm:col-span-2"><Dado label="Endereço" valor={selecionada.catequizando.endereco} /></div>
                </dl>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-semibold">Documentos</h3>
                <ul className="space-y-2">
                  {documentosObrigatorios.map((nome) => {
                    const enviado = selecionada.documentosEnviados.includes(nome);
                    return (
                      <li key={nome} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{nome}</span>
                        <Badge className={cn("border-transparent", enviado ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                          {enviado ? "Enviado" : "Não enviado"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="space-y-2">
                <Label htmlFor="parecer-secretaria" className="font-display text-base font-semibold">Parecer da Secretaria</Label>
                <Textarea id="parecer-secretaria" readOnly rows={3} value={selecionada.parecerSecretaria || "Sem parecer registrado."} />
              </section>

              <section className="space-y-2">
                <Label htmlFor="observacoes" className="font-display text-base font-semibold">Observações</Label>
                <Textarea id="observacoes" readOnly rows={2} value={selecionada.observacoes || "Sem observações."} />
              </section>

              <section className="space-y-3 border-t pt-4">
                <h3 className="font-display font-semibold">Decisão do Coordenador</h3>
                <div className="space-y-2">
                  <Label htmlFor="turma">Definir Turma</Label>
                  <Select value={turma} onValueChange={setTurma}>
                    <SelectTrigger id="turma"><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => simular("Matrícula aprovada (simulação)")}>Aprovar</Button>
                  <Button variant="destructive" onClick={() => simular("Matrícula rejeitada (simulação)")}>Rejeitar</Button>
                  <Button variant="outline" disabled={!turma} onClick={() => simular("Turma vinculada (simulação)")}>Definir Turma</Button>
                </div>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
