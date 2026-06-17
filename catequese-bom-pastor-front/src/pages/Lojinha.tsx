import milagresPaes from "@/assets/milagres-paes.jpg";
import { MainLayout } from "@/components/layout/MainLayout";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { fetchPublic } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Cross,
  Gift,
  Heart,
  Copy,
  PackageOpen,
  QrCode,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
}

const donationNeeds = [
  {
    icon: BookOpen,
    title: "Bíblias ",
    description: "Bíblias católicas ",
  },
  {
    icon: PackageOpen,
    title: "Material Catequético",
    description: "Lápis de cor, giz de cera, papel, tesouras e colas",
  },
  {
    icon: Cross,
    title: "Itens Litúrgicos",
    description: "Velas, toalhas para altar, flores artificiais",
  },
];

export default function Lojinha() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPix, setShowPix] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const { toast } = useToast();
  const pixKey = "catequese@paroquia.org.br";

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetchPublic((API_ROUTES as any).lojinhaItems || "/api/loja/itens");
        
        if (!response.ok) {
          throw new Error("Falha ao carregar produtos");
        }
        
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.itens || [];
        setProducts(items);
      } catch (error) {
        console.error("Erro ao carregar itens da loja:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os produtos da loja no momento.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast({
      title: "Chave PIX copiada!",
      description: "A chave foi copiada para a área de transferência.",
    });
  };

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Produto selecionado",
      description: `${product.nome} adicionado ao seu carrinho (Simulação).`,
    });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-navy-dark/60" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${milagresPaes})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10 px-4 py-32 md:px-6 md:py-48">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl animate-slide-up">
              Lojinha Bom Pastor
            </h1>
            <p
              className="mb-8 text-lg text-primary-foreground/90 md:text-xl animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Adquira produtos da catequese e contribua com doações de materiais
              para auxiliar na formação das crianças.
            </p>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(45 33% 97%)"
            />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Nossos Produtos
            </h2>
            <p className="text-muted-foreground">
              Produtos exclusivos da Catequese Bom Pastor
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum produto disponível no momento.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  variant="interactive"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl">
                      {product.imagemUrl || "🎁"}
                    </div>
                    <CardTitle className="text-xl">{product.nome}</CardTitle>
                    <CardDescription>{product.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="font-display text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
                    </p>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.estoque <= 0}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {product.estoque > 0 ? "Adicionar ao Carrinho" : "Esgotado"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donation Needs Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Doe Materiais para a Catequese
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sua doação de materiais ajuda diretamente na formação das
              crianças. Veja o que mais precisamos no momento:
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {donationNeeds.map((need, index) => (
              <Card
                key={need.title}
                variant="default"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/20">
                    <need.icon className="h-6 w-6 text-gold-dark" />
                  </div>
                  <CardTitle className="text-lg">{need.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {need.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Card variant="elevated" className="mx-auto max-w-2xl">
              <CardContent className="p-8 space-y-4">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gold/20">
                  <Gift className="h-8 w-8 text-gold-dark" />
                </div>
                <h3 className="font-display text-2xl font-bold">
                  Como Doar Materiais
                </h3>
                <p className="text-muted-foreground">
                  Traga suas doações pessoalmente na secretaria da paróquia
                  durante o horário de funcionamento ou entre em contato para
                  solicitar uma coleta.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setShowContactForm(true)}
                >
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Financial Donation Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <Card
              variant="elevated"
              className="overflow-hidden"
            >
              <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Heart className="h-8 w-8 text-gold-dark" />
              </div>
              <div>
                <h2 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
                  Contribuição Financeira
                </h2>
                <p className="text-muted-foreground">
                  Sua doação em dinheiro ajuda a manter os materiais didáticos,
                  eventos e formação dos catequistas. Qualquer valor faz a
                  diferença!
                </p>
              </div>
              <button
                onClick={() => setShowPix(!showPix)}
                className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 transition-colors hover:bg-muted cursor-pointer"
              >
                <QrCode className="h-16 w-16 text-muted-foreground/50" />
              </button>
              <p className="text-sm text-muted-foreground">
                {showPix ? "Copie a chave PIX abaixo" : "Clique no QR Code para ver a chave PIX"}
              </p>
              
              {showPix && (
                <div className="w-full animate-slide-up">
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                    <code className="flex-1 text-sm font-mono">{pixKey}</code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyPixKey}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                variant="gold" 
                size="lg"
                onClick={() => setShowPix(!showPix)}
              >
                {showPix ? "Ocultar Chave PIX" : "Fazer Doação via PIX"}
              </Button>
            </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl text-center">
              Como Suas Contribuições Ajudam
            </h2>
            <div className="space-y-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Material Didático</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compra de apostilas, Bíblias, materiais de arte e recursos
                    pedagógicos para todas as turmas da catequese.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Formação de Catequistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Investimento em cursos, workshops e retiros de formação para
                    nossa equipe de catequistas.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Eventos e Celebrações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organização de celebrações especiais, retiros, passeios
                    educativos e eventos comunitários para as crianças.
                  </p>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Infraestrutura</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manutenção das salas de catequese, mobiliário, equipamentos
                    audiovisuais e decoração dos ambientes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Seja Parte da Missão
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Cada contribuição, seja de produto ou doação, fortalece nossa
              missão de formar cristãos autênticos.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="xl" asChild>
                <Link to="/inscricao">Fazer Pré-Matrícula</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Dialog */}
      <ContactFormDialog
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </MainLayout>
  );
}
