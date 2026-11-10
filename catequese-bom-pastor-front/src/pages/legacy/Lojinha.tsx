import milagresPaes from "@/assets/milagres-paes.jpg";
import { MainLayout } from "@/components/layout/MainLayout";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Trash2,
  ShoppingCart,
  Upload,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
}

function isProductImageUrl(value: string | null): value is string {
  return Boolean(value && /^(https?:\/\/|\/|data:image\/)/i.test(value));
}

// Interface para controlar a quantidade no carrinho
interface CartItem {
  product: Product;
  quantity: number;
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPix, setShowPix] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  
  // Estados para controlar o carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const pixKey = "catequese@paroquia.org.br";

  useEffect(() => {
    if (!showCartDropdown) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !cartContainerRef.current?.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [showCartDropdown]);

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

  // Lógica real de adicionar ao carrinho
  const handleAddToCart = (product: Product, quantity: number) => {
    if (product.estoque <= 0) return;
    const quantityToAdd = Math.min(Math.max(1, quantity), product.estoque);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, product.estoque) }
            : item
        );
      }
      return [...prevCart, { product, quantity: quantityToAdd }];
    });
  };

  const handleProductQuantityChange = (product: Product, value: number) => {
    const quantity = Math.min(product.estoque, Math.max(1, Math.floor(value) || 1));
    const isInCart = cart.some((item) => item.product.id === product.id);

    if (isInCart) {
      setCart((prevCart) => prevCart.map((item) => (
        item.product.id === product.id ? { ...item, quantity } : item
      )));
      return;
    }

    setProductQuantities((previous) => ({ ...previous, [product.id]: quantity }));
  };

  // Remover item do carrinho
  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Cálculos do carrinho
  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.product.preco * item.quantity, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleReserveCart = async () => {
    if (cartTotalItems === 0 || isReserving) {
      return;
    }

    setIsReserving(true);

    try {
      if (!paymentReceipt) {
        toast({
          variant: "destructive",
          title: "Comprovante obrigatório",
          description: "Anexe o comprovante do PIX para enviar a compra.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("itens", JSON.stringify(cart.map((item) => ({
        itemId: item.product.id,
        quantidade: item.quantity,
      }))));
      formData.append("comprovantePagamento", paymentReceipt);

      const response = await api.post(
        (API_ROUTES as any).lojinhaReservas || "/api/loja/itens/reservas",
        formData
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Não foi possível registrar a reserva agora.");
      }

      setCart([]);
      setPaymentReceipt(null);
      setShowCartDropdown(false);

      toast({
        title: "Compra enviada",
        description: `Seu comprovante foi enviado. Aguarde a confirmação dos administradores para retirar o pedido na secretaria.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível reservar",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
      });
    } finally {
      setIsReserving(false);
    }
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
              Escolha seus produtos, pague via PIX e envie o comprovante. A retirada acontece na secretaria após a confirmação dos administradores.
            </p>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block translate-y-[1px]"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
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
              Produtos exclusivos da Catequese Bom Pastor disponíveis para reserva
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
            <Dialog
              open={Boolean(selectedProduct)}
              onOpenChange={(open) => {
                if (!open) setSelectedProduct(null);
              }}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <Card
                    key={product.id}
                    variant="interactive"
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Ver detalhes de ${product.nome}`}
                        className="w-full rounded-t-xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-5xl">
                            {isProductImageUrl(product.imagemUrl) ? (
                              <img src={product.imagemUrl} alt={product.nome} className="h-full w-full object-cover" />
                            ) : (
                              product.imagemUrl || "🎁"
                            )}
                          </div>
                          <CardTitle className="text-xl">{product.nome}</CardTitle>
                          <CardDescription>{product.descricao || "Toque para ver os detalhes do produto."}</CardDescription>
                        </CardHeader>
                        <div className="px-6 pb-4 text-center">
                          <p className="font-display text-2xl font-bold text-primary">
                            {formatCurrency(product.preco)}
                          </p>
                        </div>
                      </button>
                    </DialogTrigger>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          Qtd.
                          <Input
                            type="number"
                            min={1}
                            max={product.estoque}
                            value={cart.find((item) => item.product.id === product.id)?.quantity ?? productQuantities[product.id] ?? 1}
                            onChange={(event) => handleProductQuantityChange(product, Number(event.target.value))}
                            aria-label={`Quantidade de ${product.nome}`}
                            disabled={product.estoque <= 0}
                            className="w-16 text-center"
                          />
                        </label>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleAddToCart(product, productQuantities[product.id] ?? 1)}
                          disabled={product.estoque <= 0 || cart.some((item) => item.product.id === product.id)}
                        >
                          {cart.some((item) => item.product.id === product.id)
                            ? <Check className="mr-2 h-4 w-4" />
                            : <ShoppingBag className="mr-2 h-4 w-4" />}
                          {product.estoque <= 0
                            ? "Esgotado"
                            : cart.some((item) => item.product.id === product.id)
                              ? "Adicionado"
                              : "Adicionar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedProduct && (
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedProduct.nome}</DialogTitle>
                    <DialogDescription>Detalhes do produto</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5">
                    <div className="flex h-56 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {isProductImageUrl(selectedProduct.imagemUrl) ? (
                        <img src={selectedProduct.imagemUrl} alt={selectedProduct.nome} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-6xl">{selectedProduct.imagemUrl || "🎁"}</span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {selectedProduct.descricao || "Este produto não possui descrição."}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                      <div>
                        <p className="font-display text-2xl font-bold text-primary">
                          {formatCurrency(selectedProduct.preco)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProduct.estoque > 0
                            ? `${selectedProduct.estoque} disponível(is)`
                            : "Produto esgotado"}
                        </p>
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        Qtd.
                        <Input
                          type="number"
                          min={1}
                          max={selectedProduct.estoque}
                          value={cart.find((item) => item.product.id === selectedProduct.id)?.quantity ?? productQuantities[selectedProduct.id] ?? 1}
                          onChange={(event) => handleProductQuantityChange(selectedProduct, Number(event.target.value))}
                          aria-label={`Quantidade de ${selectedProduct.nome}`}
                          disabled={selectedProduct.estoque <= 0}
                          className="w-16 text-center"
                        />
                      </label>
                      <Button
                        onClick={() => handleAddToCart(selectedProduct, productQuantities[selectedProduct.id] ?? 1)}
                        disabled={selectedProduct.estoque <= 0 || cart.some((item) => item.product.id === selectedProduct.id)}
                      >
                        {cart.some((item) => item.product.id === selectedProduct.id)
                          ? <Check className="mr-2 h-4 w-4" />
                          : <ShoppingBag className="mr-2 h-4 w-4" />}
                        {selectedProduct.estoque <= 0
                          ? "Esgotado"
                          : cart.some((item) => item.product.id === selectedProduct.id)
                            ? "Adicionado"
                            : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          )}
        </div>
      </section>

      {/* Botão de Carrinho Flutuante e Janela de Conteúdo */}
      <div ref={cartContainerRef} className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-2xl relative bg-primary text-primary-foreground hover:bg-primary/95"
          onClick={() => setShowCartDropdown(!showCartDropdown)}
        >
          <ShoppingCart className="h-6 w-6" />
          {cartTotalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-scale-in">
              {cartTotalItems}
            </span>
          )}
        </Button>

        {/* Janela Suspensa do Carrinho */}
        {showCartDropdown && (
          <div className="absolute bottom-16 right-0 w-80 md:w-96 rounded-xl border border-border bg-card p-4 shadow-2xl animate-slide-up text-card-foreground">
            <h3 className="font-display text-lg font-bold mb-3 pb-2 border-b border-border flex items-center justify-between">
              <span>Seu Carrinho</span>
              <span className="text-xs font-normal text-muted-foreground">{cartTotalItems} itens</span>
            </h3>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                O carrinho está vazio.
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x {formatCurrency(item.product.preco)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(item.product.preco * item.quantity)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-3">
                  <div className="flex items-center justify-between font-bold text-base">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(cartTotalPrice)}</span>
                  </div>
                  <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
                    <p className="font-semibold">Pagamento via PIX</p>
                    <p className="mt-1 text-muted-foreground">Chave: <span className="font-mono text-foreground">{pixKey}</span></p>
                    <button type="button" onClick={copyPixKey} className="mt-2 text-xs font-semibold text-primary hover:underline">
                      Copiar chave PIX
                    </button>
                  </div>
                  <label className="block rounded-lg border border-dashed border-border p-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold"><Upload className="h-4 w-4" /> Comprovante do PIX *</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="mt-2 block w-full text-xs"
                      onChange={(event) => setPaymentReceipt(event.target.files?.[0] || null)}
                    />
                    {paymentReceipt && <span className="mt-1 block truncate text-xs text-muted-foreground">{paymentReceipt.name}</span>}
                  </label>
                  <Button
                    className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                    onClick={handleReserveCart}
                    disabled={isReserving}
                  >
                    {isReserving ? "Enviando..." : "Enviar compra"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Donation Needs Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        {/* ... Resto do seu código de doações permanece igual ... */}
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