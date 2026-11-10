import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { useMemo, useState } from "react";

type CreatePreMatriculaDto = {
  nomeCatequizando: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  email: string;
  telefone: string;
  alergiasProblemasSaude?: string;
  sacramentosPai: string[];
  sacramentosMae: string[];
};

type PreMatriculaFormState = CreatePreMatriculaDto & {
  aceiteReunioes: boolean;
  aceiteCompromisso: boolean;
  aceiteRegulamento: boolean;
};

const SACRAMENT_OPTIONS = [
  { value: "BATISMO", label: "Batismo" },
  { value: "EUCARISTIA", label: "Eucaristia" },
  { value: "CRISMA", label: "Crisma" },
  { value: "MATRIMONIO", label: "Matrimônio" },
] as const;

type DocumentoUploadField = "certificadoBatismo" | "comprovanteEndereco" | "certidaoDeNascimento";

const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_DOCUMENT_SIZE_MB = 5;
const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

function isValidDateString(value: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getOnlyDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatBrazilianPhone(value: string): string {
  const digits = getOnlyDigits(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidBrazilianPhone(value: string): boolean {
  const digits = getOnlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

function normalizeDateToYyyyMmDd(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseApiErrors(payload: unknown): {
  fieldErrors: Partial<Record<keyof CreatePreMatriculaDto, string>>;
  formError: string;
} {
  const fieldErrors: Partial<Record<keyof CreatePreMatriculaDto, string>> = {};
  if (!payload || typeof payload !== "object") {
    return { fieldErrors, formError: "Não foi possível enviar a pré-matrícula. Verifique os dados e tente novamente." };
  }

  const maybeMessage = (payload as { message?: unknown }).message;
  const messages = Array.isArray(maybeMessage)
    ? maybeMessage.map(String)
    : typeof maybeMessage === "string" && maybeMessage.trim()
      ? [maybeMessage]
      : [];
  const fields: Array<keyof CreatePreMatriculaDto> = [
    "nomeCatequizando",
    "dataNascimento",
    "nomePai",
    "nomeMae",
    "email",
    "telefone",
  ];
  const unassociatedMessages: string[] = [];

  for (const message of messages) {
    const field = fields.find((candidate) => message.toLowerCase().startsWith(candidate.toLowerCase()));
    if (!field) {
      unassociatedMessages.push(message);
      continue;
    }

    fieldErrors[field] = {
      nomeCatequizando: "Confira o nome informado.",
      dataNascimento: "Informe uma data de nascimento válida.",
      nomePai: "Confira o nome do pai.",
      nomeMae: "Confira o nome da mãe.",
      sacramentosPai: "Confira os sacramentos do pai.",
      sacramentosMae: "Confira os sacramentos da mãe.",
      email: "Informe um e-mail válido.",
      telefone: "Informe um telefone válido com DDD.",
    }[field];
  }

  return { fieldErrors, formError: unassociatedMessages.join(" ") };
}

function buildPayload(form: PreMatriculaFormState): CreatePreMatriculaDto {
  const payload: CreatePreMatriculaDto = {
    nomeCatequizando: form.nomeCatequizando.trim(),
    dataNascimento: normalizeDateToYyyyMmDd(form.dataNascimento),
    nomePai: form.nomePai.trim(),
    nomeMae: form.nomeMae.trim(),
    email: form.email.trim(),
    telefone: formatBrazilianPhone(form.telefone),
    alergiasProblemasSaude: form.alergiasProblemasSaude?.trim(),
    sacramentosPai: form.nomePai.trim() ? form.sacramentosPai : [],
    sacramentosMae: form.nomeMae.trim() ? form.sacramentosMae : [],
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0))
  ) as CreatePreMatriculaDto;
}

export default function PreMatriculaCrianca() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<PreMatriculaFormState>({
    nomeCatequizando: "",
    dataNascimento: "",
    nomePai: "",
    nomeMae: "",
    email: "",
    telefone: "",
    alergiasProblemasSaude: "",
    sacramentosPai: [],
    sacramentosMae: [],
    aceiteReunioes: false,
    aceiteCompromisso: false,
    aceiteRegulamento: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePreMatriculaDto, string>>>({});
  const [formError, setFormError] = useState("");
  const [documentosError, setDocumentosError] = useState<string>("");
  const [confirmacoesError, setConfirmacoesError] = useState<string>("");
  const [documentoNomes, setDocumentoNomes] = useState<Record<DocumentoUploadField, string>>({
    certificadoBatismo: "",
    comprovanteEndereco: "",
    certidaoDeNascimento: "",
  });
  const [documentoTamanhoErrors, setDocumentoTamanhoErrors] = useState<Record<DocumentoUploadField, string>>({
    certificadoBatismo: "",
    comprovanteEndereco: "",
    certidaoDeNascimento: "",
  });
  const [documentosFiles, setDocumentosFiles] = useState<Record<DocumentoUploadField, File | null>>({
    certificadoBatismo: null,
    comprovanteEndereco: null,
    certidaoDeNascimento: null,
  });

  const documentosConfig: Array<{ field: DocumentoUploadField; inputId: string; titulo: string; descricao: string }> = [
    {
      field: "certificadoBatismo",
      inputId: "certificadoBatismoBase64File",
      titulo: "Certificado de batismo *",
      descricao: `Obrigatorio. PDF, PNG, JPG ou WEBP (max. ${MAX_DOCUMENT_SIZE_MB}MB)`,
    },
    {
      field: "comprovanteEndereco",
      inputId: "comprovanteEnderecoBase64File",
      titulo: "Comprovante de endereco *",
      descricao: `Obrigatorio. PDF, PNG, JPG ou WEBP (max. ${MAX_DOCUMENT_SIZE_MB}MB)`,
    },
    {
      field: "certidaoDeNascimento",
      inputId: "certidaoDeNascimentoBase64File",
      titulo: "Certidao de nascimento *",
      descricao: `Obrigatorio. PDF, PNG, JPG ou WEBP (max. ${MAX_DOCUMENT_SIZE_MB}MB)`,
    },
  ];

  const isValid = useMemo(() => {
    return (
      data.nomeCatequizando.trim().length > 0 &&
      data.dataNascimento.trim().length > 0 &&
      isValidDateString(data.dataNascimento) &&
      (data.nomePai.trim().length > 0 || data.nomeMae.trim().length > 0) &&
      data.email.trim().length > 0 &&
      isValidEmail(data.email.trim()) &&
      data.telefone.trim().length > 0 &&
      Boolean(documentosFiles.certificadoBatismo) &&
      Boolean(documentosFiles.comprovanteEndereco) &&
      Boolean(documentosFiles.certidaoDeNascimento) &&
      data.aceiteReunioes &&
      data.aceiteCompromisso &&
      data.aceiteRegulamento
    );
  }, [data, documentosFiles]);

  const setField = <K extends keyof PreMatriculaFormState>(field: K, value: PreMatriculaFormState[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    if (field === "aceiteReunioes" || field === "aceiteCompromisso" || field === "aceiteRegulamento") {
      setConfirmacoesError("");
    }
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field as keyof CreatePreMatriculaDto]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof CreatePreMatriculaDto, string>> = {};

    if (!data.nomeCatequizando.trim()) {
      nextErrors.nomeCatequizando = "Informe o nome do catequizando.";
    }
    if (!data.dataNascimento.trim()) {
      nextErrors.dataNascimento = "Informe a data de nascimento.";
    } else if (!isValidDateString(data.dataNascimento)) {
      nextErrors.dataNascimento = "Informe uma data de nascimento válida.";
    }
    if (!data.nomePai.trim() && !data.nomeMae.trim()) {
      nextErrors.nomePai = "Informe o nome do pai ou da mãe.";
    }
    if (!data.email.trim()) {
      nextErrors.email = "Informe o e-mail.";
    } else if (!isValidEmail(data.email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (!data.telefone.trim()) {
      nextErrors.telefone = "Informe o telefone.";
    } else if (!isValidBrazilianPhone(data.telefone)) {
      nextErrors.telefone = "Informe um telefone válido com DDD.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const hasAllConfirmations = (): boolean => {
    return data.aceiteReunioes && data.aceiteCompromisso && data.aceiteRegulamento;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: DocumentoUploadField
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentosFiles((prev) => ({ ...prev, [field]: null }));
      setDocumentoNomes((prev) => ({ ...prev, [field]: "" }));
      setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
      setDocumentosFiles((prev) => ({ ...prev, [field]: null }));
      setDocumentoNomes((prev) => ({ ...prev, [field]: "" }));
      setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "Formato inválido. Envie PDF ou imagem JPG, PNG ou WEBP." }));
      toast({
        title: "Formato não permitido",
        description: "Envie apenas PDF ou imagem (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setDocumentosFiles((prev) => ({ ...prev, [field]: null }));
      setDocumentoNomes((prev) => ({ ...prev, [field]: "" }));
      setDocumentoTamanhoErrors((prev) => ({
        ...prev,
        [field]: `Arquivo muito grande. O limite e ${MAX_DOCUMENT_SIZE_MB}MB por documento.`,
      }));
      toast({
        title: "Arquivo muito grande",
        description: `Cada documento deve ter no maximo ${MAX_DOCUMENT_SIZE_MB}MB.`,
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    try {
      setDocumentosFiles((prev) => ({ ...prev, [field]: file }));
      setDocumentoNomes((prev) => ({ ...prev, [field]: file.name }));
      setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "" }));
      setDocumentosError("");
      setFormError("");
      toast({
        title: "Documento carregado",
        description: `Arquivo ${file.name} pronto para envio.`,
      });
    } catch {
      toast({
        title: "Erro no arquivo",
        description: "Não foi possível processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (field: DocumentoUploadField, inputId: string) => {
    setDocumentosFiles((prev) => ({ ...prev, [field]: null }));
    setDocumentoNomes((prev) => ({ ...prev, [field]: "" }));
    setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "" }));
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD:catequese-bom-pastor-front/src/pages/PreMatriculaCrianca.tsx
    const formElement = e.currentTarget as HTMLFormElement;
=======
>>>>>>> origin/correcoes-afonso:front/src/pages/public/PreMatriculaCrianca.tsx
    setFormError("");

    const isFormValid = validateForm();
    const confirmationsValid = hasAllConfirmations();
    const documentosValidos =
      Boolean(documentosFiles.certificadoBatismo) &&
      Boolean(documentosFiles.comprovanteEndereco) &&
      Boolean(documentosFiles.certidaoDeNascimento);

    setDocumentosError(documentosValidos ? "" : "Os 3 documentos sao obrigatorios para enviar a pre-matricula.");
    setConfirmacoesError(confirmationsValid ? "" : "As 3 confirmações obrigatorias devem ser marcadas.");

    if (!isFormValid || !confirmationsValid || !documentosValidos) {
      toast({
        title: "Revise os dados antes de enviar",
        description:
          "Preencha os campos obrigatorios com dados validos, anexe os 3 documentos e marque as 3 confirmações para prosseguir.",
        variant: "destructive",
      });
      return;
    }

    const payload = buildPayload({
      ...data,
      dataNascimento: data.dataNascimento,
    });

    const formData = new FormData();
    formData.append("nomeCatequizando", payload.nomeCatequizando);
    formData.append("dataNascimento", payload.dataNascimento);
    if (payload.nomePai) formData.append("nomePai", payload.nomePai);
    if (payload.nomeMae) formData.append("nomeMae", payload.nomeMae);
    formData.append("email", payload.email);
    formData.append("telefone", payload.telefone);
    formData.append("aceiteTermos", "true");

    if (payload.alergiasProblemasSaude) {
      formData.append("alergiasProblemasSaude", payload.alergiasProblemasSaude);
    }
    if (payload.sacramentosPai?.length) {
      formData.append("sacramentosPai", payload.sacramentosPai.join(","));
    }
    if (payload.sacramentosMae?.length) {
      formData.append("sacramentosMae", payload.sacramentosMae.join(","));
    }

    formData.append("certificadoBatismo", documentosFiles.certificadoBatismo!);
    formData.append("comprovanteEndereco", documentosFiles.comprovanteEndereco!);
    formData.append("certidaoDeNascimento", documentosFiles.certidaoDeNascimento!);

    setIsSubmitting(true);
    try {
      const response = await api.postPublic(API_ROUTES.preMatriculas, formData);

      if (!response.ok) {
        let apiError: unknown = null;
        try {
          apiError = await response.json();
        } catch {
          apiError = null;
        }

        if (response.status === 400) {
          const parsedErrors = parseApiErrors(apiError);
          setErrors(parsedErrors.fieldErrors);
          setFormError(parsedErrors.formError || (Object.keys(parsedErrors.fieldErrors).length
            ? "Revise os campos indicados e envie novamente."
            : "Não foi possível enviar a pré-matrícula. Verifique os dados e tente novamente."));
          return;
        }

        setFormError("Não foi possível enviar a pré-matrícula agora. Tente novamente em alguns minutos.");
        return;
      }

      toast({
        title: "Pré-matrícula enviada",
        description: "Sua solicitação foi enviada para a coordenação e será avaliada.",
      });

      formElement.reset();
      setData({
        nomeCatequizando: "",
        dataNascimento: "",
        nomePai: "",
        nomeMae: "",
        email: "",
        telefone: "",
        alergiasProblemasSaude: "",
        sacramentosPai: [],
        sacramentosMae: [],
        aceiteReunioes: false,
        aceiteCompromisso: false,
        aceiteRegulamento: false,
      });
      setDocumentosFiles({
        certificadoBatismo: null,
        comprovanteEndereco: null,
        certidaoDeNascimento: null,
      });
      setDocumentoNomes({
        certificadoBatismo: "",
        comprovanteEndereco: "",
        certidaoDeNascimento: "",
      });
      setDocumentoTamanhoErrors({
        certificadoBatismo: "",
        comprovanteEndereco: "",
        certidaoDeNascimento: "",
      });
      setDocumentosError("");
      setConfirmacoesError("");
      setErrors({});
      setFormError("");
    } catch {
      setFormError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-10 md:py-16">
        <div className="container px-4 md:px-6">
          <Card variant="elevated" className="mx-auto max-w-3xl overflow-hidden border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Pré-Matrícula da Criança</CardTitle>
              <CardDescription>Preencha os dados básicos para iniciarmos o processo.</CardDescription>
              
              {/* Avisos importantes */}
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">Importante</p>
                      <p className="text-amber-800 text-sm mt-1">
                        O preenchimento deste formulário <strong>não garante a vaga</strong>. A coordenação entrará em contato por email para confirmar a matrícula.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">Taxa de Matrícula</p>
                      <p className="text-blue-800 text-sm mt-1">
                        Há uma taxa de matrícula no valor de <strong>R$ 50,00</strong> que deverá ser paga após a confirmação da vaga pela coordenação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </CardHeader>
            <CardContent className="bg-background">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border bg-card p-4 md:p-5">
                  <h3 className="mb-4 text-base font-semibold">Dados da Criança</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCatequizando">Nome da criança</Label>
                      <Input
                        id="nomeCatequizando"
                        value={data.nomeCatequizando}
                        onChange={(e) => setField("nomeCatequizando", e.target.value)}
                        placeholder="Ex.: Maria de Souza"
                      />
                      {errors.nomeCatequizando && <p className="text-sm text-destructive">{errors.nomeCatequizando}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de nascimento</Label>
                        <Input
                          id="dataNascimento"
                          type="date"
                          value={data.dataNascimento}
                          onChange={(e) => setField("dataNascimento", e.target.value)}
                        />
                        {errors.dataNascimento && <p className="text-sm text-destructive">{errors.dataNascimento}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5">
                  <h3 className="mb-4 text-base font-semibold">Dados de Contato</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Informe ao menos o pai ou a mãe. Marque os sacramentos que cada um já recebeu; não é necessário enviar comprovante.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        { key: "nomePai", sacKey: "sacramentosPai", label: "Nome do pai" },
                        { key: "nomeMae", sacKey: "sacramentosMae", label: "Nome da mãe" },
                      ] as const).map(({ key, sacKey, label }) => (
                        <div key={key} className="space-y-3 rounded-lg border p-3">
                          <div className="space-y-2">
                            <Label htmlFor={key}>{label}</Label>
                            <Input id={key} value={data[key]} onChange={(e) => setField(key, e.target.value)} />
                            {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
                          </div>
                          <fieldset className="space-y-2" disabled={!data[key].trim()}>
                            <legend className="text-sm font-medium">Sacramentos</legend>
                            {SACRAMENT_OPTIONS.map((option) => (
                              <div key={option.value} className="flex items-center gap-2">
                                <Checkbox
                                  id={`${sacKey}-${option.value}`}
                                  checked={data[sacKey].includes(option.value)}
                                  onCheckedChange={(checked) =>
                                    setField(
                                      sacKey,
                                      checked === true
                                        ? [...data[sacKey], option.value]
                                        : data[sacKey].filter((item) => item !== option.value),
                                    )
                                  }
                                />
                                <Label htmlFor={`${sacKey}-${option.value}`} className="font-normal">{option.label}</Label>
                              </div>
                            ))}
                          </fieldset>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail do responsável</Label>
                        <Input
                          id="email"
                          type="email"
                          value={data.email}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder="Ex.: seu@email.com"
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone do responsável</Label>
                        <Input
                          id="telefone"
                          value={data.telefone}
                          onChange={(e) => setField("telefone", formatBrazilianPhone(e.target.value))}
                          placeholder="Ex.: (11) 99999-9999"
                          inputMode="numeric"
                          maxLength={15}
                        />
                        {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alergiasProblemasSaude">Alergias / problemas de saúde</Label>
                      <Textarea
                        id="alergiasProblemasSaude"
                        value={data.alergiasProblemasSaude ?? ""}
                        onChange={(e) => setField("alergiasProblemasSaude", e.target.value)}
                        placeholder="Se sim, informe alergias, medicações ou cuidados especiais"
                      />
                    </div>

                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5">
                  <h3 className="mb-2 text-base font-semibold">Documentos da criança</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Formatos aceitos: PDF, JPG, PNG e WEBP. Tamanho maximo:
                    {` ${MAX_DOCUMENT_SIZE_MB}MB por arquivo`}.
                  </p>

                  <div className="space-y-3">
                    {documentosConfig.map((doc) => {
                      const nomeArquivo = documentoNomes[doc.field];
                      const tamanhoError = documentoTamanhoErrors[doc.field];
                      const temArquivo = Boolean(nomeArquivo);

                      return (
                        <div
                          key={doc.field}
                          className={`rounded-lg border p-3 transition-colors ${
                            temArquivo ? "border-emerald-300 bg-emerald-50/70" : "border-dashed border-border bg-background"
                          }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <Label htmlFor={doc.inputId} className="text-sm font-medium">
                                {doc.titulo}
                              </Label>
                              <p className="mt-1 text-xs text-muted-foreground">{doc.descricao}</p>
                              <p className="mt-1 truncate text-sm">
                                {temArquivo ? nomeArquivo : "Nenhum arquivo selecionado"}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={doc.inputId}
                                className="inline-flex h-9 cursor-pointer items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent"
                              >
                                Selecionar arquivo
                              </label>

                              {temArquivo && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 px-3 text-sm"
                                  onClick={() => handleRemoveFile(doc.field, doc.inputId)}
                                >
                                  Remover
                                </Button>
                              )}
                            </div>
                          </div>

                          <input
                            id={doc.inputId}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, doc.field)}
                          />
                          {tamanhoError && <p className="mt-2 text-sm text-destructive">{tamanhoError}</p>}
                        </div>
                      );
                    })}
                  </div>
                  {documentosError && <p className="mt-3 text-sm text-destructive">{documentosError}</p>}
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 md:p-5">
                  <h3 className="mb-3 text-base font-semibold text-amber-900">Confirmações obrigatórias</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="aceiteReunioes"
                        checked={data.aceiteReunioes}
                        onCheckedChange={(v) => setField("aceiteReunioes", Boolean(v))}
                      />
                      <Label htmlFor="aceiteReunioes" className="text-sm leading-relaxed">
                        Concordo em participar das reuniões de pais e responsáveis.
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="aceiteCompromisso"
                        checked={data.aceiteCompromisso}
                        onCheckedChange={(v) => setField("aceiteCompromisso", Boolean(v))}
                      />
                      <Label htmlFor="aceiteCompromisso" className="text-sm leading-relaxed">
                        Comprometo-me a acompanhar a criança nas atividades e celebrações da paróquia.
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="aceiteRegulamento"
                        checked={data.aceiteRegulamento}
                        onCheckedChange={(v) => setField("aceiteRegulamento", Boolean(v))}
                      />
                      <Label htmlFor="aceiteRegulamento" className="text-sm leading-relaxed">
                        Li e concordo com o regulamento da catequese.
                      </Label>
                    </div>
                  </div>
                  {confirmacoesError && <p className="mt-3 text-sm text-destructive">{confirmacoesError}</p>}
                </div>

                <div className="pt-1">
                  {formError && <p role="alert" className="mb-3 text-sm text-destructive">{formError}</p>}
                  <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Pré-Matrícula"}
                  </Button>
                  {!isValid && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Preencha os campos obrigatórios e confirme os termos para liberar o envio.
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
