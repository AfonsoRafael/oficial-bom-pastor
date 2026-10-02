import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ROUTES } from "@/lib/routes";
import { fetchPublic } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type InviteDetails = { email: string; nome: string };
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export default function PrimeiroAcesso() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setInviteError("O link está incompleto. Abra o convite recebido por e-mail ou solicite um novo à coordenação.");
      setLoading(false);
      return;
    }

    fetchPublic(`${API_ROUTES.auth.passwordSetup}?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Este convite é inválido ou expirou.");
        setInvite(payload);
      })
      .catch((error: unknown) => setInviteError(error instanceof Error ? error.message : "Não foi possível validar o convite."))
      .finally(() => setLoading(false));
  }, [token]);

  const passwordIsStrong = STRONG_PASSWORD.test(password);
  const passwordsMatch = password.length > 0 && password === confirmation;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordIsStrong || !passwordsMatch) return;

    setSubmitting(true);
    try {
      const response = await fetchPublic(API_ROUTES.auth.passwordSetup, {
        method: "POST",
        body: JSON.stringify({ token, senha: password, confirmacao: confirmation }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível criar sua senha.");
      setComplete(true);
      toast({ title: "Senha criada", description: "Agora você já pode entrar no portal." });
    } catch (error: unknown) {
      toast({
        title: "Não foi possível criar a senha",
        description: error instanceof Error ? error.message : "Tente novamente ou solicite um novo convite.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle>{complete ? "Acesso pronto" : "Crie sua senha"}</CardTitle>
            <CardDescription>
              {complete
                ? "Sua senha foi cadastrada. Entre no portal com o e-mail aprovado pela coordenação."
                : invite?.nome
                  ? `Olá, ${invite.nome}. Defina uma senha para acessar o portal.`
                  : "Esta página só pode ser acessada pelo convite enviado ao seu e-mail."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Validando convite...</p>
            ) : complete ? (
              <Button className="w-full" onClick={() => navigate("/login", { state: { email: invite?.email } })}>
                Ir para o login
              </Button>
            ) : inviteError ? (
              <div className="space-y-4">
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {inviteError}
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="invite-email">E-mail aprovado</Label>
                  <Input id="invite-email" value={invite?.email ?? ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-describedby="password-requirements"
                  />
                  <p id="password-requirements" className="text-xs text-muted-foreground">
                    Use 12 caracteres ou mais, incluindo maiúscula, minúscula, número e símbolo.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirme a senha</Label>
                  <Input
                    id="confirmation"
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                  {confirmation && !passwordsMatch && <p className="text-xs text-destructive">As senhas não coincidem.</p>}
                </div>
                <Button type="submit" className="w-full" disabled={!passwordIsStrong || !passwordsMatch || submitting}>
                  {submitting ? "Salvando..." : "Criar senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}