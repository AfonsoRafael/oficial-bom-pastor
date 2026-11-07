import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MatriculaSucessoPage() {
  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-background via-muted/30 to-sage-light/20 px-4 py-16">
        <Card variant="elevated" className="mx-auto max-w-lg text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden="true" />
            <CardTitle>Simulação concluída</CardTitle>
            <CardDescription>Nenhuma matrícula ou documento foi enviado ou salvo. Esta página é apenas uma demonstração.</CardDescription>
          </CardHeader>
          <CardContent><Button asChild><Link to="/">Voltar à Home</Link></Button></CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
