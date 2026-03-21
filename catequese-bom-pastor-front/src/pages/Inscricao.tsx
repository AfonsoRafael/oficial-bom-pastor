import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Inscricao() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    sexo: "",
    perfil: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    nivelEstudo: "",
    experienciaPrevia: "",
    motivacao: "",
    disponibilidade: "",
    conhecimentoFe: "",
    sacramentoBatismo: false,
    sacramentoEucaristia: false,
    sacramentoConfirmacao: false,
    sacramentoMatrimonio: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.nome ||
      !formData.email ||
      !formData.telefone ||
      !formData.dataNascimento ||
      !formData.perfil
    ) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Aqui você enviaria os dados para a API
    console.log("Dados do formulário:", formData);

    toast({
      title: "Solicitação enviada",
      description:
        "Sua solicitação foi enviada para a coordenação e será avaliada.",
    });

    // Resetar formulário
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      sexo: "",
      perfil: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      nivelEstudo: "",
      experienciaPrevia: "",
      motivacao: "",
      disponibilidade: "",
      conhecimentoFe: "",
      sacramentoBatismo: false,
      sacramentoEucaristia: false,
      sacramentoConfirmacao: false,
      sacramentoMatrimonio: false,
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Header com botão voltar */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          {/* Card principal */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-3xl">Novo Catequista</CardTitle>
              <CardDescription className="text-blue-100">
                Bem-vindo! Preencha o formulário abaixo para se inscrever em
                nosso programa de catequese
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Seção 1: Dados Pessoais */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">
                      1. Dados Pessoais
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perfil" className="font-semibold">
                        Você é pai/mãe ou catequista? *
                      </Label>
                      <Select
                        value={formData.perfil}
                        onValueChange={(value) => handleSelectChange("perfil", value)}
                      >
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pai">Pai/Mãe</SelectItem>
                          <SelectItem value="catequista">Catequista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="font-semibold">
                        Nome Completo *
                      </Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        className="border-blue-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu.email@exemplo.com"
                        className="border-blue-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="font-semibold">
                        Telefone/WhatsApp *
                      </Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(11) 98765-4321"
                        className="border-blue-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento" className="font-semibold">
                        Data de Nascimento *
                      </Label>
                      <Input
                        id="dataNascimento"
                        name="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        className="border-blue-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sexo" className="font-semibold">
                        Sexo
                      </Label>
                      <Select
                        value={formData.sexo}
                        onValueChange={(value) =>
                          handleSelectChange("sexo", value)
                        }
                      >
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Quais sacramentos você já recebeu?</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Label htmlFor="sacramentoBatismo" className="flex items-center gap-2 text-sm text-blue-900">
                          <Checkbox
                            id="sacramentoBatismo"
                            checked={formData.sacramentoBatismo}
                            onCheckedChange={(v) =>
                              setFormData((prev) => ({ ...prev, sacramentoBatismo: Boolean(v) }))
                            }
                          />
                          Batismo
                        </Label>
                        <Label htmlFor="sacramentoEucaristia" className="flex items-center gap-2 text-sm text-blue-900">
                          <Checkbox
                            id="sacramentoEucaristia"
                            checked={formData.sacramentoEucaristia}
                            onCheckedChange={(v) =>
                              setFormData((prev) => ({ ...prev, sacramentoEucaristia: Boolean(v) }))
                            }
                          />
                          Eucaristia
                        </Label>
                        <Label htmlFor="sacramentoConfirmacao" className="flex items-center gap-2 text-sm text-blue-900">
                          <Checkbox
                            id="sacramentoConfirmacao"
                            checked={formData.sacramentoConfirmacao}
                            onCheckedChange={(v) =>
                              setFormData((prev) => ({ ...prev, sacramentoConfirmacao: Boolean(v) }))
                            }
                          />
                          Confirmação
                        </Label>
                        <Label htmlFor="sacramentoMatrimonio" className="flex items-center gap-2 text-sm text-blue-900">
                          <Checkbox
                            id="sacramentoMatrimonio"
                            checked={formData.sacramentoMatrimonio}
                            onCheckedChange={(v) =>
                              setFormData((prev) => ({ ...prev, sacramentoMatrimonio: Boolean(v) }))
                            }
                          />
                          Matrimônio
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nivelEstudo" className="font-semibold">
                        Nível de Escolaridade
                      </Label>
                      <Select
                        value={formData.nivelEstudo}
                        onValueChange={(value) =>
                          handleSelectChange("nivelEstudo", value)
                        }
                      >
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamental">
                            Ensino Fundamental
                          </SelectItem>
                          <SelectItem value="medio">Ensino Médio</SelectItem>
                          <SelectItem value="superior">
                            Ensino Superior
                          </SelectItem>
                          <SelectItem value="pos-graduacao">
                            Pós-Graduação
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Endereço */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">
                      2. Endereço
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="endereco" className="font-semibold">
                        Endereço
                      </Label>
                      <Input
                        id="endereco"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        placeholder="Rua, número e complemento"
                        className="border-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="font-semibold">
                        Cidade
                      </Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                        className="border-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="font-semibold">
                        Estado
                      </Label>
                      <Input
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        placeholder="UF"
                        maxLength={2}
                        className="border-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep" className="font-semibold">
                        CEP
                      </Label>
                      <Input
                        id="cep"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                        className="border-blue-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Experiência e Motivação */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold text-blue-900">
                      3. Formação Religiosa
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="experienciaPrevia"
                        className="font-semibold"
                      >
                        Tem experiência anterior com educação religiosa ou
                        voluntariado?
                      </Label>
                      <Textarea
                        id="experienciaPrevia"
                        name="experienciaPrevia"
                        value={formData.experienciaPrevia}
                        onChange={handleChange}
                        placeholder="Conte-nos sobre sua experiência (opcional)"
                        className="border-blue-200 resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivacao" className="font-semibold">
                        O que o motivou a se inscrever como catequista?
                      </Label>
                      <Textarea
                        id="motivacao"
                        name="motivacao"
                        value={formData.motivacao}
                        onChange={handleChange}
                        placeholder="Compartilhe suas motivações"
                        className="border-blue-200 resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="disponibilidade"
                        className="font-semibold"
                      >
                        Qual sua disponibilidade?
                      </Label>
                      <Select
                        value={formData.disponibilidade}
                        onValueChange={(value) =>
                          handleSelectChange("disponibilidade", value)
                        }
                      >
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sabados">
                            Sábados pela manhã (9h às 11h)
                          </SelectItem>
                          <SelectItem value="sabados-tarde">
                            Sábados à tarde (14h às 16h)
                          </SelectItem>
                          <SelectItem value="semana">Entre semana</SelectItem>
                          <SelectItem value="flexivel">
                            Horário flexível
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-auto"
                  >
                    Enviar Solicitação
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <Link to="/">Cancelar</Link>
                  </Button>
                </div>

                {/* Nota */}
                <p className="text-sm text-gray-600 text-center pt-4 border-t">
                  Os campos marcados com * são obrigatórios. Após a análise de
                  sua inscrição, entraremos em contato para os próximos passos.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
