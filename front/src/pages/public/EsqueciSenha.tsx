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
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Digite seu e-mail para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post(API_ROUTES.auth.forgotPassword, { email });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao solicitar reset de senha");
      }

      setEmailSent(true);
      
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Verifique o e-mail informado e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-background via-muted/30 to-sage-light/20 px-4 py-12">
        <Card variant="elevated" className="w-full max-w-md animate-slide-up">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {emailSent ? "E-mail enviado!" : "Esqueci minha senha"}
              </CardTitle>
              <CardDescription className="mt-2">
                {emailSent 
                  ? "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha."
                  : "Digite seu e-mail e enviaremos instruções para redefinir sua senha."
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isLoading ? "Enviando..." : "Enviar instruções"}
                </Button>

                <Button variant="ghost" asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Link>
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                  <p>
                    Enviamos um e-mail para <strong className="text-foreground">{email}</strong>.
                  </p>
                  <p className="mt-2">
                    Não recebeu? Verifique a pasta de spam ou tente novamente.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setEmailSent(false)} 
                    className="flex-1"
                  >
                    Tentar outro e-mail
                  </Button>
                  <Button 
                    variant="default" 
                    asChild 
                    className="flex-1"
                  >
                    <Link to="/login">
                      Voltar para o login
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
