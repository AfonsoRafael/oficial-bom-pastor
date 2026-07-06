import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PrimeiroAcesso() {
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    nome: "",
    email: "",
    perfil: "",
    senha: "",
    confirmacao: "",
    termos: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isValid = Boolean(
    data.nome.trim() &&
    data.email.trim() &&
    data.perfil.trim() &&
    data.senha.trim() &&
    data.confirmacao.trim() &&
    data.senha === data.confirmacao &&
    data.termos
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast({
        title: "Complete os campos",
        description: "Preencha os campos obrigatórios, confirme a senha e aceite os termos.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await api.post(API_ROUTES.auth.register, {
        nome: data.nome.trim(),
        email: data.email.trim(),
        senha: data.senha,
        confirmSenha: data.confirmacao,
        role: data.perfil,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Erro ao registrar. Tente novamente.");
      }

      const result = await response.json();

      // Converte o role para minúsculo para padronizar
      const userRole = (result.user?.role || data.perfil).toLowerCase();

      login(userRole, result.accessToken, result.refreshToken, { ...result.user, role: userRole });

      toast({
        title: "Acesso criado",
        description: `Bem-vindo(a), ${result.user.nome}!`,
      });

      // Redireciona baseado no role
      if (userRole === "catechist") {
        navigate("/catequista");
      } else if (userRole === "parent") {
        navigate("/pais");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/pais");
      }
    } catch (error: any) {
      toast({
        title: "Não foi possível registrar",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Primeiro Acesso</CardTitle>
            <CardDescription>Crie seu acesso e aguarde a validação da coordenação.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={data.nome}
                  onChange={(e) => setData({ ...data, nome: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Você é pai/mãe ou catequista?</Label>
                <Select
                  value={data.perfil}
                  onValueChange={(value) => setData({ ...data, perfil: value })}
                >
                  <SelectTrigger id="perfil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Pai/Mãe</SelectItem>
                    <SelectItem value="catechist">Catequista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={data.senha}
                    onChange={(e) => setData({ ...data, senha: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmacao">Confirmar senha</Label>
                  <Input
                    id="confirmacao"
                    type="password"
                    value={data.confirmacao}
                    onChange={(e) => setData({ ...data, confirmacao: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-md border p-3">
                <Checkbox
                  id="termos"
                  checked={data.termos}
                  onCheckedChange={(checked) => setData({ ...data, termos: Boolean(checked) })}
                />
                <Label htmlFor="termos" className="text-sm text-muted-foreground">
                  Li e aceito o tratamento dos dados para criar e validar meu acesso.
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
                {isLoading ? "Enviando..." : "Solicitar acesso"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem acesso? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
