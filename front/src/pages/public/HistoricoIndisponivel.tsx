import { DashboardShell } from "@/components/layout/DashboardShell";
import { ADMIN_NAV_ITEMS } from "@/lib/sidebarNavItems";

export default function HistoricoIndisponivel() {
  return (
    <DashboardShell items={ADMIN_NAV_ITEMS} title="Histórico" description="Histórico de turmas e catequizandos">
      <p>O histórico ainda não está integrado aos registros reais. Os dados de demonstração foram retirados para evitar informações incorretas.</p>
    </DashboardShell>
  );
}
