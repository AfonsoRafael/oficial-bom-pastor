import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  type: "material_donation";
  name: string;
  email: string;
  phone: string;
  materialType: string;
  quantity: string;
  deliveryDate: string;
  observation: string;
  criadoEm: string;
  read: boolean;
}

interface ContactFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactFormDialog({
  isOpen,
  onClose,
}: ContactFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    materialType: "",
    quantity: "",
    deliveryDate: "",
    observation: "",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.materialType ||
      !formData.quantity ||
      !formData.deliveryDate
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simular envio da mensagem
      const newMessage: ContactMessage = {
        id: Date.now().toString(),
        type: "material_donation",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        materialType: formData.materialType,
        quantity: formData.quantity,
        deliveryDate: formData.deliveryDate,
        observation: formData.observation,
        criadoEm: new Date().toISOString(),
        read: false,
      };

      // Salvar em localStorage para admin acessar
      const existingMessages = JSON.parse(
        localStorage.getItem("contactMessages") || "[]"
      );
      localStorage.setItem(
        "contactMessages",
        JSON.stringify([...existingMessages, newMessage])
      );

      toast({
        title: "Doação registrada!",
        description: "Sua doação foi registrada com sucesso. Em breve entraremos em contato.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        materialType: "",
        quantity: "",
        deliveryDate: "",
        observation: "",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao registrar sua doação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Registrar Doação</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para registrar sua doação de material
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg hover:bg-muted p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Telefone (opcional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Tipo de Material */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Tipo de Material *
              </label>
              <input
                type="text"
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                placeholder="Ex: Livros, Brinquedos, Uniformes"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="1"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Data de Entrega */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Data de Entrega *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Observação */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Observações (opcional)
              </label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleChange}
                placeholder="Informações adicionais sobre a doação..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Registrando..." : "Registrar Doação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
