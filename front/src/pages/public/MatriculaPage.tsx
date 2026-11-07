import { useEffect, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, FileText, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const niveisCatequeticos = [
  "Nível I",
  "Nível II",
  "Nível III",
] as const;

const obrigatorio = z.string().trim().min(1, "Este campo é obrigatório.");
const telefone = obrigatorio.refine(
  (value) => /^\d{10,11}$/.test(value.replace(/\D/g, "")),
  "Informe um telefone com DDD e 10 ou 11 dígitos.",
);

const schema = z.object({
  nomeResponsavel: obrigatorio,
  cpf: obrigatorio.refine((value) => /^\d{11}$/.test(value.replace(/\D/g, "")), "Informe o CPF com 11 dígitos."),
  nascimentoResponsavel: obrigatorio,
  telefone,
  whatsapp: telefone,
  email: obrigatorio.email("Informe um e-mail válido."),
  parentesco: obrigatorio,
  nomeCatequizando: obrigatorio,
  nascimentoCatequizando: obrigatorio,
  endereco: obrigatorio,
  telefoneEmergencia: telefone,
  nivelCatequetico: z.enum(niveisCatequeticos, { errorMap: () => ({ message: "Selecione um nível catequético." }) }),
  observacoes: z.string(),
});

type FormValues = z.infer<typeof schema>;
type DocumentKey = "nascimento" | "batismo" | "residencia" | "responsavel";
const documentos: { key: DocumentKey; label: string }[] = [
  { key: "nascimento", label: "Certidão de Nascimento" },
  { key: "batismo", label: "Certificado de Batismo" },
  { key: "residencia", label: "Comprovante de Residência" },
  { key: "responsavel", label: "Documento do Responsável" },
];
const etapas = ["Responsável", "Catequizando", "Documentos", "Revisão"];
const camposPorEtapa: FieldPath<FormValues>[][] = [
  ["nomeResponsavel", "cpf", "nascimentoResponsavel", "telefone", "whatsapp", "email", "parentesco"],
  ["nomeCatequizando", "nascimentoCatequizando", "endereco", "telefoneEmergencia", "nivelCatequetico"],
];

function Campo({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Resumo({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words font-medium">{value || "Não informado"}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatarData(value: string) {
  const [ano, mes, dia] = value.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
}

export default function MatriculaPage() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(0);
  const [usarMesmoTelefone, setUsarMesmoTelefone] = useState(false);
  const [arquivos, setArquivos] = useState<Record<DocumentKey, string>>({
    nascimento: "", batismo: "", residencia: "", responsavel: "",
  });
  const { register, control, handleSubmit, trigger, setValue, watch, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeResponsavel: "", cpf: "", nascimentoResponsavel: "", telefone: "", whatsapp: "", email: "",
      parentesco: "", nomeCatequizando: "", nascimentoCatequizando: "", endereco: "",
      telefoneEmergencia: "", observacoes: "",
    },
    shouldUnregister: false,
  });
  const telefoneResponsavel = watch("telefone");

  useEffect(() => {
    if (usarMesmoTelefone) {
      setValue("whatsapp", telefoneResponsavel, { shouldValidate: true });
    }
  }, [setValue, telefoneResponsavel, usarMesmoTelefone]);

  async function proximaEtapa() {
    const campos = camposPorEtapa[etapa];
    if (!campos || await trigger(campos, { shouldFocus: true })) {
      setEtapa((atual) => atual + 1);
    }
  }

  const dados = getValues();
  const inputError = (name: keyof FormValues) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-background via-muted/30 to-sage-light/20 py-10 md:py-16">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Catequese Bom Pastor</p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Matrícula na Catequese</h1>
            <p className="mt-3 text-muted-foreground">Preencha as informações em quatro etapas.</p>
          </div>
          <div className="mb-6 rounded-lg border border-gold/40 bg-gold-light/30 p-4 text-sm" role="status">
            Demonstração: os dados e documentos não serão enviados nem salvos. Não utilize informações reais.
          </div>
          <ol aria-label="Etapas da matrícula" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {etapas.map((titulo, index) => (
              <li key={titulo} aria-current={index === etapa ? "step" : undefined} className="flex items-center gap-2 text-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${index <= etapa ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {index < etapa ? <Check className="h-4 w-4" aria-label="Concluída" /> : index + 1}
                </span>
                <span className={index === etapa ? "font-semibold text-foreground" : "text-muted-foreground"}>{titulo}</span>
              </li>
            ))}
          </ol>
          <Card variant="elevated" className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>{etapas[etapa]}</CardTitle>
              <CardDescription>
                {etapa === 0 && "Informe os dados do responsável. Campos marcados com * são obrigatórios."}
                {etapa === 1 && "Informe os dados do catequizando. Campos marcados com * são obrigatórios."}
                {etapa === 2 && "Selecione os documentos para a simulação. Os anexos são opcionais e não serão enviados."}
                {etapa === 3 && "Confira as informações antes de simular o envio."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form noValidate onSubmit={handleSubmit(() => {
                if (etapa === 3) navigate("/inscricao/sucesso");
              })} className="space-y-6">
                {etapa === 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Campo id="nomeResponsavel" label="Nome Completo *" error={errors.nomeResponsavel?.message}><Input id="nomeResponsavel" autoComplete="name" {...register("nomeResponsavel")} {...inputError("nomeResponsavel")} /></Campo></div>
                    <Campo id="cpf" label="CPF *" error={errors.cpf?.message}><Input id="cpf" inputMode="numeric" {...register("cpf")} {...inputError("cpf")} /></Campo>
                    <Campo id="nascimentoResponsavel" label="Data de Nascimento *" error={errors.nascimentoResponsavel?.message}><Input id="nascimentoResponsavel" type="date" {...register("nascimentoResponsavel")} {...inputError("nascimentoResponsavel")} /></Campo>
                    <Campo id="telefone" label="Telefone *" error={errors.telefone?.message}><Input id="telefone" type="tel" autoComplete="tel" {...register("telefone")} {...inputError("telefone")} /></Campo>
                    <div className="space-y-3">
                      <Campo id="whatsapp" label="WhatsApp *" error={errors.whatsapp?.message}><Input id="whatsapp" type="tel" readOnly={usarMesmoTelefone} {...register("whatsapp")} {...inputError("whatsapp")} /></Campo>
                      <div className="flex items-center gap-2"><Checkbox id="mesmoTelefone" checked={usarMesmoTelefone} onCheckedChange={(checked) => setUsarMesmoTelefone(checked === true)} /><Label htmlFor="mesmoTelefone" className="font-normal">Usar o telefone informado</Label></div>
                    </div>
                    <Campo id="email" label="E-mail *" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} {...inputError("email")} /></Campo>
                    <Campo id="parentesco" label="Parentesco *" error={errors.parentesco?.message}><Input id="parentesco" {...register("parentesco")} {...inputError("parentesco")} /></Campo>
                  </div>
                )}
                {etapa === 1 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Campo id="nomeCatequizando" label="Nome Completo *" error={errors.nomeCatequizando?.message}><Input id="nomeCatequizando" {...register("nomeCatequizando")} {...inputError("nomeCatequizando")} /></Campo></div>
                    <Campo id="nascimentoCatequizando" label="Data de Nascimento *" error={errors.nascimentoCatequizando?.message}><Input id="nascimentoCatequizando" type="date" {...register("nascimentoCatequizando")} {...inputError("nascimentoCatequizando")} /></Campo>
                    <Campo id="telefoneEmergencia" label="Telefone de Emergência *" error={errors.telefoneEmergencia?.message}><Input id="telefoneEmergencia" type="tel" {...register("telefoneEmergencia")} {...inputError("telefoneEmergencia")} /></Campo>
                    <div className="sm:col-span-2"><Campo id="endereco" label="Endereço *" error={errors.endereco?.message}><Input id="endereco" autoComplete="street-address" {...register("endereco")} {...inputError("endereco")} /></Campo></div>
                    <div className="sm:col-span-2">
                      <Campo id="nivelCatequetico" label="Nível Catequético *" error={errors.nivelCatequetico?.message}>
                        <Controller name="nivelCatequetico" control={control} render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="nivelCatequetico" ref={field.ref} onBlur={field.onBlur} {...inputError("nivelCatequetico")}><SelectValue placeholder="Selecione um nível" /></SelectTrigger>
                            <SelectContent>{niveisCatequeticos.map((opcao) => <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>)}</SelectContent>
                          </Select>
                        )} />
                      </Campo>
                    </div>
                    <div className="sm:col-span-2"><Campo id="observacoes" label="Observações"><Textarea id="observacoes" rows={4} {...register("observacoes")} /></Campo></div>
                  </div>
                )}
                  <div hidden={etapa !== 2} className={etapa === 2 ? "grid gap-4 sm:grid-cols-2" : undefined}>
                    {documentos.map(({ key, label }) => (
                      <Card key={key} variant="flat" className="border border-border bg-muted/20">
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-center gap-2 font-medium"><FileText className="h-5 w-5 text-primary" /><Label htmlFor={`documento-${key}`}>{label}</Label></div>
                          <Input id={`documento-${key}`} type="file" onChange={(event) => setArquivos((atuais) => ({ ...atuais, [key]: event.target.files?.[0]?.name ?? "" }))} />
                          <p className="break-all text-sm text-muted-foreground">{arquivos[key] ? `Selecionado: ${arquivos[key]}` : "Nenhum arquivo selecionado"}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                {etapa === 3 && (
                  <div className="space-y-6">
                    <section className="space-y-4 rounded-lg border p-4"><h2 className="font-display text-xl font-semibold">Responsável</h2><Resumo items={[
                      { label: "Nome completo", value: dados.nomeResponsavel }, { label: "CPF", value: dados.cpf },
                      { label: "Data de nascimento", value: formatarData(dados.nascimentoResponsavel) },
                      { label: "Telefone", value: dados.telefone }, { label: "WhatsApp", value: dados.whatsapp },
                      { label: "E-mail", value: dados.email }, { label: "Parentesco", value: dados.parentesco },
                    ]} /></section>
                    <section className="space-y-4 rounded-lg border p-4"><h2 className="font-display text-xl font-semibold">Catequizando</h2><Resumo items={[
                      { label: "Nome completo", value: dados.nomeCatequizando }, { label: "Data de nascimento", value: formatarData(dados.nascimentoCatequizando) },
                      { label: "Endereço", value: dados.endereco }, { label: "Telefone de emergência", value: dados.telefoneEmergencia },
                      { label: "Nível catequético", value: dados.nivelCatequetico }, { label: "Observações", value: dados.observacoes },
                    ]} /></section>
                    <section className="space-y-4 rounded-lg border p-4"><h2 className="font-display text-xl font-semibold">Documentos</h2><Resumo items={documentos.map(({ key, label }) => ({ label, value: arquivos[key] || "Não selecionado" }))} /></section>
                  </div>
                )}
                <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                  {etapa > 0 ? <Button type="button" variant="outline" onClick={() => setEtapa((atual) => atual - 1)}><ArrowLeft /> Voltar</Button> : <Button type="button" variant="ghost" asChild><Link to="/">Voltar à Home</Link></Button>}
                  {etapa < 3 ? <Button key="next" type="button" onClick={proximaEtapa}>Próximo <ArrowRight /></Button> : <Button key="submit" type="submit"><Upload /> Enviar Matrícula</Button>}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
