import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  sacramentos: string;
  alergias: string;
};

type DocumentoUploadField = "comprovanteResidencia" | "documentoCpf";

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
  const [formData, setFormData] = useState<InscricaoCatequistaForm>({
    nome: "",
    dataNascimento: "",
    dataBatismo: "",
    email: "",
    telefone: "",
    casado: "",
    casadaIgrejaCatolica: "",
    sacramentos: "",
    alergias: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InscricaoCatequistaForm, string>>>({});
  const [documentosError, setDocumentosError] = useState("");
  const [documentoNomes, setDocumentoNomes] = useState<Record<DocumentoUploadField, string>>({
    comprovanteResidencia: "",
    documentoCpf: "",
  });
  const [documentoTamanhoErrors, setDocumentoTamanhoErrors] = useState<Record<DocumentoUploadField, string>>({
    comprovanteResidencia: "",
    documentoCpf: "",
  });
  const [documentosFiles, setDocumentosFiles] = useState<Record<DocumentoUploadField, File | null>>({
    comprovanteResidencia: null,
    documentoCpf: null,
  });

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
  ];

  const isValid = useMemo(() => {
    return (
      formData.nome.trim().length > 0 &&
      formData.dataNascimento.trim().length > 0 &&
      isValidDateString(formData.dataNascimento) &&
      formData.email.trim().length > 0 &&
      isValidEmail(formData.email.trim()) &&
      formData.telefone.trim().length > 0 &&
      isValidBrazilianPhone(formData.telefone) &&
      formData.casado.trim().length > 0 &&
      (formData.casado !== "SIM" || formData.casadaIgrejaCatolica.trim().length > 0) &&
      Boolean(documentosFiles.comprovanteResidencia) &&
      Boolean(documentosFiles.documentoCpf)
    );
  }, [formData, documentosFiles]);

  const setField = <K extends keyof InscricaoCatequistaForm>(field: K, value: InscricaoCatequistaForm[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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

    if (formData.casado === "SIM" && !formData.casadaIgrejaCatolica.trim()) {
      nextErrors.casadaIgrejaCatolica = "Informe se e casada(o) na Igreja Catolica.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: DocumentoUploadField) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentosFiles((prev) => ({ ...prev, [field]: null }));
      setDocumentoNomes((prev) => ({ ...prev, [field]: "" }));
      setDocumentoTamanhoErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
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
    const documentosValidos =
      Boolean(documentosFiles.comprovanteResidencia) &&
      Boolean(documentosFiles.documentoCpf);

    setDocumentosError(documentosValidos ? "" : "Os 2 documentos sao obrigatorios para concluir a inscricao.");

    if (!isFormValid || !documentosValidos) {
      toast({
        title: "Revise os dados",
        description: "Preencha os campos obrigatorios e anexe os 2 documentos para enviar.",
        variant: "destructive",
      });
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
      sacramentos: formData.sacramentos.trim(),
      alergias: formData.alergias.trim(),
    };

    const requestData = new FormData();
    requestData.append("nome", payload.nome);
    requestData.append("dataNascimento", payload.dataNascimento);
    if (payload.dataBatismo) {
      requestData.append("dataBatismo", payload.dataBatismo);
    }
    requestData.append("email", payload.email);
    requestData.append("telefone", payload.telefone);
    requestData.append("casado", payload.casado);
    if (payload.casado === "SIM") {
      requestData.append("casadaIgrejaCatolica", payload.casadaIgrejaCatolica);
    }

    if (payload.sacramentos) {
      requestData.append("sacramentos", payload.sacramentos);
    }
    if (payload.alergias) {
      requestData.append("alergias", payload.alergias);
    }

    requestData.append("comprovanteResidencia", documentosFiles.comprovanteResidencia!);
    requestData.append("documentoCpf", documentosFiles.documentoCpf!);

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
        sacramentos: "",
        alergias: "",
      });
      setErrors({});
      setDocumentosError("");
      setDocumentoNomes({
        comprovanteResidencia: "",
        documentoCpf: "",
      });
      setDocumentoTamanhoErrors({
        comprovanteResidencia: "",
        documentoCpf: "",
      });
      setDocumentosFiles({
        comprovanteResidencia: null,
        documentoCpf: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
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

          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-3xl">Seja Catequista</CardTitle>
              <CardDescription className="text-blue-100">
                Preencha seus dados para iniciar sua inscricao como catequista.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">Dados Cadastrais</h3>
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
                        className="border-blue-200"
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
                        className="border-blue-200"
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
                        className="border-blue-200"
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
                        className="border-blue-200"
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
                        <SelectTrigger id="casado" className="border-blue-200">
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
                          <SelectTrigger id="casadaIgrejaCatolica" className="border-blue-200">
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
                      <Label htmlFor="sacramentos" className="font-semibold">
                        Sacramentos
                      </Label>
                      <Textarea
                        id="sacramentos"
                        value={formData.sacramentos}
                        onChange={(e) => setField("sacramentos", e.target.value)}
                        placeholder="Ex.: Batismo, Eucaristia e Crisma"
                        className="resize-none border-blue-200"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alergias" className="font-semibold">
                        Alergias / observacoes de saude
                      </Label>
                      <Textarea
                        id="alergias"
                        value={formData.alergias}
                        onChange={(e) => setField("alergias", e.target.value)}
                        placeholder="Informe alergias ou deixe em branco"
                        className="resize-none border-blue-200"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">Documentos</h3>
                  </div>

                  <div className="space-y-4">
                    {documentosConfig.map((doc) => (
                      <div key={doc.field} className="rounded-lg border border-blue-100 p-4">
                        <Label htmlFor={doc.inputId} className="font-semibold">
                          {doc.titulo}
                        </Label>
                        <p className="mt-1 text-xs text-slate-500">{doc.descricao}</p>

                        <Input
                          id={doc.inputId}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="mt-3 border-blue-200"
                          onChange={(e) => handleFileChange(e, doc.field)}
                        />

                        {documentoNomes[doc.field] && (
                          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-700">{documentoNomes[doc.field]}</span>
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

                <div className="flex gap-4 pt-2">
                  <Button
                    type="submit"
                    className="h-auto flex-1 bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar inscricao"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link to="/">Cancelar</Link>
                  </Button>
                </div>

                <p className="border-t pt-4 text-center text-sm text-gray-600">
                  Campos com * sao obrigatorios. Sua inscricao sera analisada pela coordenacao.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
