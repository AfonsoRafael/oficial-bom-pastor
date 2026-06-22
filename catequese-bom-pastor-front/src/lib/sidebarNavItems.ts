import {
  BookOpen,
  Calendar,
  Camera,
  ClipboardList,
  DollarSign,
  FileText,
  Music,
  Users,
} from "lucide-react";
import type { SidebarNavItem } from "@/components/layout/SidebarNav";

export const ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Gerenciar Turmas", to: "/admin", icon: Users },
  { label: "Adicionar Catequizando", to: "/admin/add-catequizando", icon: Users },
  { label: "Inscrições de Catequista", to: "/admin/inscricoes-catequistas", icon: ClipboardList },
  { label: "Chamada", to: "/admin/chamada", icon: ClipboardList },
  { label: "Minhas Turmas", to: "/admin/minhas-turmas", icon: Users },
  { label: "Cronograma", to: "/admin/cronograma", icon: Calendar },
  // { label: "Material", to: "/admin/material", icon: BookOpen },
  // { label: "Músicas", to: "/admin/musicas", icon: Music },
  { label: "Fotos", to: "/admin/fotos", icon: Camera },
  { label: "Contabilidade", to: "/admin/contabilidade", icon: DollarSign },
  { label: "Histórico", to: "/admin/historico", icon: Calendar },
];

export const CATECHIST_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Chamada", to: "/catequista/chamada", icon: ClipboardList },
  { label: "Minhas Turmas", to: "/catequista/minhas-turmas", icon: Users },
  { label: "Cronograma", to: "/catequista/cronograma", icon: Calendar },
  // { label: "Material", to: "/catequista/material", icon: BookOpen },
  // { label: "Músicas", to: "/catequista/musicas", icon: Music },
];

export const PARENT_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Meus Filhos", to: "/pais", icon: Users },
  { label: "Documentos", to: "/pais/documentos", icon: FileText },
  { label: "Cronograma", to: "/pais/cronograma", icon: Calendar },
  // { label: "Galeria", to: "/pais/galeria", icon: Camera },
];

export function getDashboardNavItems(isAdminRoute: boolean): SidebarNavItem[] {
  return isAdminRoute ? ADMIN_NAV_ITEMS : CATECHIST_NAV_ITEMS;
}
