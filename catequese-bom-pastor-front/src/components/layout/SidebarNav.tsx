import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SidebarNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  pathname: string;
  collapsible?: boolean;
}

export function SidebarNav({ items, pathname, collapsible = false }: SidebarNavProps) {
  return (
    <nav className={collapsible ? "flex-1 space-y-1 px-2 py-4" : "flex-1 space-y-1 p-4"}>
      {items.map(({ label, to, icon: Icon }) => (
        <Button
          key={to}
          variant={pathname === to ? "navActive" : "nav"}
          className="sidebar-nav-item w-full justify-start px-3"
          asChild
        >
          <Link to={to}>
            <Icon className="sidebar-nav-icon h-4 w-4 shrink-0" />
            <span className="sidebar-nav-label">{label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}
