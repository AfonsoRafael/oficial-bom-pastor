import { useState } from "react";
import { FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatusMatricula = "PENDENTE" | "EM_ANALISE" | "PENDENCIA_DOCUMENTAL" | "APROVADA" | "REJEITADA";
type StatusDocumento = "ENVIADO" | "NAO_ENVIADO";

interface DocumentoMock {
  nome: string;
  status: StatusDocumento;
}

interface MatriculaMock {
  protocolo: string;
  data: string;
  status: StatusMatricula;
  nivel: "Nível I" | "Nível II" | "Nível III";
  responsavel: {
    nome: string;
    cpf: string;
    nascimento: string;
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
    observacoes: string;
  };
  documentos: DocumentoMock[];
  parecer: string;
}

const statusConfig: Record<StatusMatricula, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "border-transparent bg-gray-100 text-gray-800" },
  EM_ANALISE: { label: "Em análise", className: "border-transparent bg-blue-100 text-blue-800" },
  PENDENCIA_DOCUMENTAL: { label: "Pendência documental", className: "border-transparent bg-amber-100 text-amber-800" },
  APROVADA: { label: "Aprovada", className: "border-transparent bg-green-100 text-green-800" },
  REJEITADA: { label: "Rejeitada", className: "border-transparent bg-red-100 text-red-800" },
};

const nomesDocumentos = [
  "Certidão de Nascimento",
  "Certificado de Batismo",
  "Comprovante de Residência",
  "Documento do Responsável",
];

const docs = (enviados: number[]): DocumentoMock[] =>
  nomesDocumentos.map((nome, i) => ({ nome, status: enviados.includes(i) ? "ENVIADO" : "NAO_ENVIADO" }));

// Dados fictícios apenas para demonstração.
const matriculasMock: MatriculaMock[] = [
  {
    protocolo: "MAT-2025-0001",
    data: "2025-02-03",
    status: "PENDENTE",
    nivel: "Nível I",
    responsavel: { nome: "Responsável Exemplo A", cpf: "000.000.000-00", nascimento: "1985-05-10", telefone: "(00) 0000-0001", whatsapp: "(00) 90000-0001", email: "exemplo.a@exemplo.invalid", parentesco: "Mãe" },
    catequizando: { nome: "Catequizando Exemplo A", nascimento: "2016-03-12", endereco: "Rua Fictícia, 100 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1001", observacoes: "" },
    documentos: docs([0, 1, 2, 3]),
    parecer: "",
  },
  {
    protocolo: "MAT-2025-0002",
    data: "2025-02-05",
    status: "EM_ANALISE",
    nivel: "Nível II",
    responsavel: { nome: "Responsável Exemplo B", cpf: "000.000.000-00", nascimento: "1982-11-20", telefone: "(00) 0000-0002", whatsapp: "(00) 90000-0002", email: "exemplo.b@exemplo.invalid", parentesco: "Pai" },
    catequizando: { nome: "Catequizando Exemplo B", nascimento: "2014-08-01", endereco: "Av. Fictícia, 200 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1002", observacoes: "Alergia a amendoim." },
    documentos: docs([0, 1, 2, 3]),
    parecer: "Documentação conferida parcialmente.",
  },
  {
    protocolo: "MAT-2025-0003",
    data: "2025-02-07",
    status: "PENDENCIA_DOCUMENTAL",
    nivel: "Nível III",
    responsavel: { nome: "Responsável Exemplo C", cpf: "000.000.000-00", nascimento: "1979-01-30", telefone: "(00) 0000-0003", whatsapp: "(00) 90000-0003", email: "exemplo.c@exemplo.invalid", parentesco: "Avó" },
    catequizando: { nome: "Catequizando Exemplo C", nascimento: "2012-06-25", endereco: "Travessa Fictícia, 300 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1003", observacoes: "" },
    documentos: docs([0, 3]),
    parecer: "Falta o certificado de batismo e o comprovante de residência.",
  },
  {
    protocolo: "MAT-2025-0004",
    data: "2025-02-10",
    status: "APROVADA",
    nivel: "Nível I",
    responsavel: { nome: "Responsável Exemplo D", cpf: "000.000.000-00", nascimento: "1990-09-15", telefone: "(00) 0000-0004", whatsapp: "(00) 90000-0004", email: "exemplo.d@exemplo.invalid", parentesco: "Mãe" },
    catequizando: { nome: "Catequizando Exemplo D", nascimento: "2016-12-02", endereco: "Rua Fictícia, 400 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1004", observacoes: "" },
    documentos: docs([0, 1, 2, 3]),
    parecer: "Documentos completos.",
  },
  {
    protocolo: "MAT-2025-0005",
    data: "2025-02-12",
    status: "REJEITADA",
    nivel: "Nível II",
    responsavel: { nome: "Responsável Exemplo E", cpf: "000.000.000-00", nascimento: "1988-04-04", telefone: "(00) 0000-0005", whatsapp: "(00) 90000-0005", email: "exemplo.e@exemplo.invalid", parentesco: "Tio" },
    catequizando: { nome: "Catequizando Exemplo E", nascimento: "2018-07-19", endereco: "Rua Fictícia, 500 - Bairro Exemplo", telefoneEmergencia: "(00) 90000-1005", observacoes: "" },
    documentos: docs([3]),
    parecer: "Idade incompatível com o nível solicitado.",
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

export default function SecretariaMatriculasPage() {
  const { toast } = useToast();
  const [selecionada, setSelecionada] = useState<MatriculaMock | null>(null);
  const [parecer, setParecer] = useState("");

  const abrir = (m: MatriculaMock) => {
    setSelecionada(m);
    setParecer(m.parecer);
  };

  const salvarParecer = () => {
    toast({
      title: "Parecer salvo (simulação)",
      description: "Nada foi enviado ou gravado: esta tela usa apenas dados de demonstração.",
    });
  };

  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-background via-muted/30 to-sage-light/20 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Matrículas recebidas</h1>
            <p className="text-muted-foreground">Área da Secretaria — acompanhamento das matrículas.</p>
          </div>

          <p role="note" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Demonstração: os dados abaixo são fictícios e nenhuma informação é consultada ou salva em servidor.
          </p>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Lista de matrículas</CardTitle>
              <CardDescription>{matriculasMock.length} matrículas de exemplo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Catequizando</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasMock.map((m) => (
                    <TableRow key={m.protocolo}>
                      <TableCell className="whitespace-nowrap font-medium">{m.protocolo}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.responsavel.nome}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.catequizando.nome}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.nivel}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatarData(m.data)}</TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
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
                    <span>{selecionada.nivel} • {formatarData(selecionada.data)}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <section className="space-y-2">
                <h3 className="font-display font-semibold">Dados do Responsável</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Dado label="Nome" valor={selecionada.responsavel.nome} />
                  <Dado label="CPF" valor={selecionada.responsavel.cpf} />
                  <Dado label="Nascimento" valor={formatarData(selecionada.responsavel.nascimento)} />
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
                  <div className="sm:col-span-2"><Dado label="Observações" valor={selecionada.catequizando.observacoes} /></div>
                </dl>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-semibold">Documentos Enviados</h3>
                <ul className="space-y-2">
                  {selecionada.documentos.map((d) => (
                    <li key={d.nome} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{d.nome}</span>
                      <Badge className={cn(d.status === "ENVIADO" ? "border-transparent bg-green-100 text-green-800" : "border-transparent bg-amber-100 text-amber-800")}>
                        {d.status === "ENVIADO" ? "Enviado" : "Não enviado"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <Label htmlFor="parecer" className="font-display text-base font-semibold">Parecer da Secretaria</Label>
                <Textarea
                  id="parecer"
                  value={parecer}
                  onChange={(e) => setParecer(e.target.value)}
                  placeholder="Escreva o parecer da Secretaria"
                  rows={4}
                />
                <Button onClick={salvarParecer} className="w-full sm:w-auto">Salvar Parecer</Button>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
