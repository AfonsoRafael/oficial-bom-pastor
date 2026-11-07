import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type InscricaoCatequistaForm = {
  nome: string;
  dataNascimento: string;
  dataBatismo: string;
  email: string;
  telefone: string;
  casado: string;
  casadaIgrejaCatolica: string;
  sacramentos: string[];
  possuiAlergias: string;
  alergias: string;
  sobreVoce: string;
};

const SACRAMENT_OPTIONS = [
  { value: "BATISMO", label: "Batismo", documentField: "comprovanteSacramentoBatismo", requestField: "comprovanteSacramentoBatismo" },
  { value: "EUCARISTIA", label: "Eucaristia", documentField: "comprovanteSacramentoEucaristia", requestField: "comprovanteSacramentoEucaristia" },
  { value: "CRISMA", label: "Crisma", documentField: "comprovanteSacramentoCrisma", requestField: "comprovanteSacramentoCrisma" },
  { value: "MATRIMONIO", label: "Matrimônio", documentField: "comprovanteSacramentoMatrimonio", requestField: "comprovanteSacramentoMatrimonio" },
] as const;

type SacramentDocumentField = (typeof SACRAMENT_OPTIONS)[number]["documentField"];
type DocumentoUploadField = "comprovanteResidencia" | "documentoCpf" | SacramentDocumentField;

const createEmptyDocumentFiles = (): Record<DocumentoUploadField, File | null> => ({
  comprovanteResidencia: null,
  documentoCpf: null,
  comprovanteSacramentoBatismo: null,
  comprovanteSacramentoEucaristia: null,
  comprovanteSacramentoCrisma: null,
  comprovanteSacramentoMatrimonio: null,
});

const createEmptyDocumentNames = (): Record<DocumentoUploadField, string> => ({
  comprovanteResidencia: "",
  documentoCpf: "",
  comprovanteSacramentoBatismo: "",
  comprovanteSacramentoEucaristia: "",
  comprovanteSacramentoCrisma: "",
  comprovanteSacramentoMatrimonio: "",
});

const createEmptyDocumentErrors = (): Record<DocumentoUploadField, string> => ({
  comprovanteResidencia: "",
  documentoCpf: "",
  comprovanteSacramentoBatismo: "",
  comprovanteSacramentoEucaristia: "",
  comprovanteSacramentoCrisma: "",
  comprovanteSacramentoMatrimonio: "",
});

const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_DOCUMENT_SIZE_MB = 5;
const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

function getOnlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidDateString(value: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatBrazilianPhone(value: string): string {
  const digits = getOnlyDigits(value).slice(0, 11);

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

function parseApiErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Nao foi possivel enviar a inscricao agora. Tente novamente.";
  }

  const maybeMessage = (payload as { message?: unknown }).message;
  if (Array.isArray(maybeMessage)) {
    return maybeMessage.map((item) => String(item)).join("\n");
  }

  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  return "Nao foi possivel enviar a inscricao agora. Tente novamente.";
}

export default function Inscricao() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMissionTerms, setShowMissionTerms] = useState(false);
  const [missionTermsAccepted, setMissionTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<InscricaoCatequistaForm>({
    nome: "",
    dataNascimento: "",
    dataBatismo: "",
    email: "",
    telefone: "",
    casado: "",
    casadaIgrejaCatolica: "",
    sacramentos: [],
    possuiAlergias: "",
    alergias: "",
    sobreVoce: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InscricaoCatequistaForm, string>>>({});
  const [documentosError, setDocumentosError] = useState("");
  const [documentoNomes, setDocumentoNomes] = useState(createEmptyDocumentNames);
  const [documentoTamanhoErrors, setDocumentoTamanhoErrors] = useState(createEmptyDocumentErrors);
  const [documentosFiles, setDocumentosFiles] = useState(createEmptyDocumentFiles);

  const documentosConfig: Array<{ field: DocumentoUploadField; inputId: string; titulo: string; descricao: string }> = [
    {
      field: "comprovanteResidencia",
      inputId: "comprovanteResidenciaFile",
      titulo: "Comprovante de residencia *",
      descricao: `Obrigatorio. PDF, PNG, JPG ou WEBP (max. ${MAX_DOCUMENT_SIZE_MB}MB).`,
    },
    {
      field: "documentoCpf",
      inputId: "documentoCpfFile",
      titulo: "Documento de CPF *",
      descricao: `Obrigatorio. PDF, PNG, JPG ou WEBP (max. ${MAX_DOCUMENT_SIZE_MB}MB).`,
    },
    ...SACRAMENT_OPTIONS.filter((option) => formData.sacramentos.includes(option.value)).map((option) => ({
      field: option.documentField,
      inputId: `${option.documentField}File`,
      titulo: `Comprovante de ${option.label.toLowerCase()} *`,
      descricao: `Obrigatório para o sacramento selecionado. PDF ou imagem, até ${MAX_DOCUMENT_SIZE_MB}MB.`,
    })),
  ];

  const missingRequirements = useMemo(() => {
    const missing: string[] = [];
    if (!formData.nome.trim()) missing.push("informe seu nome completo");
    if (!formData.dataNascimento.trim() || !isValidDateString(formData.dataNascimento)) {
      missing.push("informe uma data de nascimento válida");
    }
    if (!formData.email.trim() || !isValidEmail(formData.email.trim())) missing.push("informe um e-mail válido");
    if (!formData.telefone.trim() || !isValidBrazilianPhone(formData.telefone)) {
      missing.push("informe um celular válido com DDD");
    }
    if (!formData.casado) missing.push("responda se é casado(a)");
    if (formData.casado === "SIM" && !formData.casadaIgrejaCatolica) {
      missing.push("informe se é casado(a) na Igreja Católica");
    }
    if (!formData.possuiAlergias) missing.push("informe se possui alergias");
    if (formData.possuiAlergias === "SIM" && !formData.alergias.trim()) {
      missing.push("descreva suas alergias");
    }
    if (!documentosFiles.comprovanteResidencia) missing.push("anexe o comprovante de residência");
    if (!documentosFiles.documentoCpf) missing.push("anexe o documento de CPF");
    for (const sacrament of SACRAMENT_OPTIONS) {
      if (formData.sacramentos.includes(sacrament.value) && !documentosFiles[sacrament.documentField]) {
        missing.push(`anexe o comprovante de ${sacrament.label.toLowerCase()}`);
      }
    }
    return missing;
  }, [formData, documentosFiles]);

  const isValid = missingRequirements.length === 0;

  const setField = <K extends keyof InscricaoCatequistaForm>(field: K, value: InscricaoCatequistaForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowMissionTerms(false);
    setMissionTermsAccepted(false);
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleSacrament = (value: (typeof SACRAMENT_OPTIONS)[number]["value"], checked: boolean) => {
    const option = SACRAMENT_OPTIONS.find((item) => item.value === value);
    setField(
      "sacramentos",
      checked
        ? [...formData.sacramentos, value]
        : formData.sacramentos.filter((item) => item !== value),
    );
    if (!checked && option) {
      handleRemoveFile(option.documentField, `${option.documentField}File`);
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof InscricaoCatequistaForm, string>> = {};

    if (!formData.nome.trim()) {
      nextErrors.nome = "Informe o nome completo.";
    }

    if (!formData.dataNascimento.trim()) {
      nextErrors.dataNascimento = "Informe a data de nascimento.";
    } else if (!isValidDateString(formData.dataNascimento)) {
      nextErrors.dataNascimento = "Informe uma data valida.";
    }

    if (formData.dataBatismo.trim() && !isValidDateString(formData.dataBatismo)) {
      nextErrors.dataBatismo = "Informe uma data de batismo valida.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Informe o e-mail.";
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = "Informe um e-mail valido.";
    }

    if (!formData.telefone.trim()) {
      nextErrors.telefone = "Informe o celular.";
    } else if (!isValidBrazilianPhone(formData.telefone)) {
      nextErrors.telefone = "Informe um celular valido com DDD.";
    }

    if (!formData.casado.trim()) {
      nextErrors.casado = "Informe se e casada(o).";
    }

    if (!formData.possuiAlergias) {
      nextErrors.possuiAlergias = "Informe se possui alergias.";
    } else if (formData.possuiAlergias === "SIM" && !formData.alergias.trim()) {
      nextErrors.alergias = "Descreva as alergias ou observações de saúde.";
    }

    if (formData.casado === "SIM" && !formData.casadaIgrejaCatolica.trim()) {
      nextErrors.casadaIgrejaCatolica = "Informe se e casada(o) na Igreja Catolica.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: DocumentoUploadField) => {
    setShowMissionTerms(false);
    setMissionTermsAccepted(false);
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
      setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "Formato inválido. Envie PDF, JPG, PNG ou WEBP." }));
      toast({
        title: "Formato nao permitido",
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
        [field]: `Arquivo muito grande. Limite de ${MAX_DOCUMENT_SIZE_MB}MB por documento.`,
      }));
      toast({
        title: "Arquivo muito grande",
        description: `Cada documento deve ter no maximo ${MAX_DOCUMENT_SIZE_MB}MB.`,
        variant: "destructive",
      });
      e.currentTarget.value = "";
      return;
    }

    setDocumentosFiles((prev) => ({ ...prev, [field]: file }));
    setDocumentoNomes((prev) => ({ ...prev, [field]: file.name }));
    setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "" }));
    setDocumentosError("");
  };

  const handleRemoveFile = (field: DocumentoUploadField, inputId: string) => {
    setShowMissionTerms(false);
    setMissionTermsAccepted(false);
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

    const isFormValid = validateForm();
    const documentosValidos = documentosConfig.every((documento) => Boolean(documentosFiles[documento.field]));

    setDocumentosError(documentosValidos ? "" : "Anexe os documentos obrigatórios, incluindo o comprovante de cada sacramento selecionado.");

    if (!isFormValid || !documentosValidos) {
      toast({
        title: "Revise os dados",
        description: "Preencha os campos obrigatórios e anexe todos os comprovantes solicitados.",
        variant: "destructive",
      });
      return;
    }

    if (!missionTermsAccepted) {
      setShowMissionTerms(true);
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      dataNascimento: formData.dataNascimento,
      dataBatismo: formData.dataBatismo,
      email: formData.email.trim(),
      telefone: formatBrazilianPhone(formData.telefone),
      casado: formData.casado,
      casadaIgrejaCatolica: formData.casadaIgrejaCatolica,
      sacramentos: formData.sacramentos.join(", "),
      alergias: formData.possuiAlergias === "SIM" ? formData.alergias.trim() : "",
      sobreVoce: formData.sobreVoce.trim(),
    };

    const requestData = new FormData();
    requestData.append("nome", payload.nome);
    requestData.append("dataNascimento", payload.dataNascimento);
    if (payload.dataBatismo) {
      requestData.append("dataBatismo", payload.dataBatismo);
    }
    requestData.append("email", payload.email);
    requestData.append("telefone", payload.telefone);
    requestData.append("aceiteTermoMissao", "true");
    requestData.append("casado", payload.casado);
    if (payload.casado === "SIM") {
      requestData.append("casadaIgrejaCatolica", payload.casadaIgrejaCatolica);
    }
    if (payload.sobreVoce) {
      requestData.append("sobreVoce", payload.sobreVoce);
    }

    if (payload.sacramentos) {
      requestData.append("sacramentos", payload.sacramentos);
    }
    if (payload.alergias) {
      requestData.append("alergias", payload.alergias);
    }

    requestData.append("comprovanteResidencia", documentosFiles.comprovanteResidencia!);
    requestData.append("documentoCpf", documentosFiles.documentoCpf!);
    for (const sacrament of SACRAMENT_OPTIONS) {
      if (formData.sacramentos.includes(sacrament.value)) {
        requestData.append(sacrament.requestField, documentosFiles[sacrament.documentField]!);
      }
    }

    setIsSubmitting(true);
    try {
      const response = await api.postPublic(API_ROUTES.catequistasInscricao, requestData);

      if (!response.ok) {
        let apiError: unknown = null;
        try {
          apiError = await response.json();
        } catch {
          apiError = null;
        }

        toast({
          title: "Erro ao enviar",
          description: parseApiErrorMessage(apiError),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscricao enviada",
        description: "Recebemos seus dados. Em breve entraremos em contato.",
      });

      setFormData({
        nome: "",
        dataNascimento: "",
        dataBatismo: "",
        email: "",
        telefone: "",
        casado: "",
        casadaIgrejaCatolica: "",
        sacramentos: [],
        possuiAlergias: "",
        alergias: "",
        sobreVoce: "",
      });
      setErrors({});
      setDocumentosError("");
      setDocumentoNomes(createEmptyDocumentNames());
      setDocumentoTamanhoErrors(createEmptyDocumentErrors());
      setDocumentosFiles(createEmptyDocumentFiles());
      setShowMissionTerms(false);
      setMissionTermsAccepted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gold transition-colors hover:text-gold/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="rounded-t-lg bg-primary text-primary-foreground dark:bg-navy-dark">
              <CardTitle className="text-3xl">Seja Catequista</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Preencha seus dados para iniciar sua inscricao como catequista.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-foreground">Dados Cadastrais</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nome" className="font-semibold">
                        Nome completo *
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setField("nome", e.target.value)}
                        placeholder="Seu nome completo"
                        className="border-border"
                        required
                      />
                      {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento" className="font-semibold">
                        Data de nascimento *
                      </Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => setField("dataNascimento", e.target.value)}
                        className="border-border"
                        required
                      />
                      {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataBatismo" className="font-semibold">
                        Data de batismo
                      </Label>
                      <Input
                        id="dataBatismo"
                        type="date"
                        value={formData.dataBatismo}
                        onChange={(e) => setField("dataBatismo", e.target.value)}
                        className="border-border"
                      />
                      {errors.dataBatismo && <p className="text-sm text-red-600">{errors.dataBatismo}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="font-semibold">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="border-border"
                        required
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="telefone" className="font-semibold">
                        Celular *
                      </Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setField("telefone", formatBrazilianPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className="border-blue-200"
                        required
                      />
                      {errors.telefone && <p className="text-sm text-red-600">{errors.telefone}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="casado" className="font-semibold">
                        E casado(a)? *
                      </Label>
                      <Select
                        value={formData.casado}
                        onValueChange={(value) => {
                          setField("casado", value);
                          if (value !== "SIM") {
                            setField("casadaIgrejaCatolica", "");
                          }
                        }}
                      >
                        <SelectTrigger id="casado" className="border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIM">Sim</SelectItem>
                          <SelectItem value="NAO">Nao</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.casado && <p className="text-sm text-red-600">{errors.casado}</p>}
                    </div>

                    {formData.casado === "SIM" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="casadaIgrejaCatolica" className="font-semibold">
                          Casado(a) na Igreja Catolica? *
                        </Label>
                        <Select
                          value={formData.casadaIgrejaCatolica}
                          onValueChange={(value) => setField("casadaIgrejaCatolica", value)}
                        >
                          <SelectTrigger id="casadaIgrejaCatolica" className="border-border">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIM">Sim</SelectItem>
                            <SelectItem value="NAO">Nao</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.casadaIgrejaCatolica && (
                          <p className="text-sm text-red-600">{errors.casadaIgrejaCatolica}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold">Sacramentos recebidos</Label>
                      <div className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2">
                        {SACRAMENT_OPTIONS.map((sacrament) => (
                          <div key={sacrament.value} className="flex items-center gap-2">
                            <Checkbox
                              id={`sacramento-${sacrament.value}`}
                              checked={formData.sacramentos.includes(sacrament.value)}
                              onCheckedChange={(checked) => toggleSacrament(sacrament.value, Boolean(checked))}
                            />
                            <Label htmlFor={`sacramento-${sacrament.value}`} className="font-normal">
                              {sacrament.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="possuiAlergias" className="font-semibold">
                        Possui alergias ou observações de saúde? *
                      </Label>
                      <Select
                        value={formData.possuiAlergias}
                        onValueChange={(value) => {
                          setField("possuiAlergias", value);
                          if (value === "NAO") setField("alergias", "");
                        }}
                      >
                        <SelectTrigger id="possuiAlergias" className="border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NAO">Não</SelectItem>
                          <SelectItem value="SIM">Sim</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.possuiAlergias && <p className="text-sm text-red-600">{errors.possuiAlergias}</p>}
                    </div>

                    {formData.possuiAlergias === "SIM" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="alergias" className="font-semibold">
                          Descreva as alergias ou observações de saúde *
                        </Label>
                        <Textarea
                          id="alergias"
                          value={formData.alergias}
                          onChange={(e) => setField("alergias", e.target.value)}
                          placeholder="Informe alergias, medicações ou cuidados especiais"
                          className="resize-none border-border"
                          rows={3}
                          required
                        />
                        {errors.alergias && <p className="text-sm text-red-600">{errors.alergias}</p>}
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sobreVoce" className="font-semibold">
                        Conte um pouco sobre você
                      </Label>
                      <Textarea
                        id="sobreVoce"
                        value={formData.sobreVoce}
                        onChange={(event) => setField("sobreVoce", event.target.value)}
                        placeholder="Conte sobre sua caminhada de fé, experiências e motivação para servir na catequese."
                        className="resize-y border-border"
                        rows={4}
                        maxLength={2000}
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {formData.sobreVoce.length}/2000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">Documentos</h3>
                  </div>

                  <div className="space-y-4">
                    {documentosConfig.map((doc) => (
                      <div key={doc.field} className="rounded-lg border border-border p-4">
                        <Label htmlFor={doc.inputId} className="font-semibold">
                          {doc.titulo}
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">{doc.descricao}</p>

                        <Input
                          id={doc.inputId}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="mt-3 border-border"
                          onChange={(e) => handleFileChange(e, doc.field)}
                        />

                        {documentoNomes[doc.field] && (
                          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                            <span className="text-foreground">{documentoNomes[doc.field]}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFile(doc.field, doc.inputId)}
                            >
                              Remover
                            </Button>
                          </div>
                        )}

                        {documentoTamanhoErrors[doc.field] && (
                          <p className="mt-2 text-sm text-red-600">{documentoTamanhoErrors[doc.field]}</p>
                        )}
                      </div>
                    ))}

                    {documentosError && <p className="text-sm text-red-600">{documentosError}</p>}
                  </div>
                </div>

                {showMissionTerms && (
                  <section
                    className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-5"
                    aria-labelledby="mission-terms-title"
                  >
                    <div className="space-y-2">
                      <h3 id="mission-terms-title" className="text-lg font-semibold text-foreground">
                        Confirmação do compromisso de catequista
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        A missão de catequista envolve compromisso com a comunidade e com a formação na fé. Ao aceitar, comprometo-me a:
                      </p>
                      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                        <li>participar das formações, reuniões e atividades para as quais for convocado(a);</li>
                        <li>preparar e conduzir os encontros de catequese com responsabilidade e fidelidade às orientações da Igreja e da coordenação;</li>
                        <li>acolher crianças e famílias com respeito, cuidado e bom testemunho cristão;</li>
                        <li>zelar pela segurança, dignidade e confidencialidade das informações das pessoas atendidas;</li>
                        <li>comunicar à coordenação ausências, dificuldades ou situações que exijam acompanhamento.</li>
                      </ul>
                    </div>
                    <div className="flex items-start gap-3 border-t border-primary/15 pt-4">
                      <Checkbox
                        id="aceiteTermoMissao"
                        checked={missionTermsAccepted}
                        onCheckedChange={(checked) => setMissionTermsAccepted(Boolean(checked))}
                      />
                      <Label htmlFor="aceiteTermoMissao" className="cursor-pointer text-sm font-medium leading-relaxed">
                        Estou de acordo com o compromisso descrito acima.
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowMissionTerms(false);
                        setMissionTermsAccepted(false);
                      }}
                    >
                      Voltar e revisar os dados
                    </Button>
                  </section>
                )}

                <div className="flex gap-4 pt-2">
                  <Button
                    type="submit"
                    className="h-auto flex-1 py-2 font-semibold"
                    disabled={isSubmitting || (showMissionTerms && !missionTermsAccepted)}
                  >
                    {isSubmitting
                      ? "Enviando..."
                      : showMissionTerms
                        ? "Estou de acordo e enviar inscrição"
                        : "Enviar inscrição"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link to="/">Cancelar</Link>
                  </Button>
                </div>

                <p className="border-t pt-4 text-center text-sm text-muted-foreground">
                  Campos com * sao obrigatorios. Sua inscricao sera analisada pela coordenacao.
                </p>
                {!isValid && (
                  <p className="text-center text-sm text-muted-foreground" aria-live="polite">
                    Para enviar, {missingRequirements.join("; ")}.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
