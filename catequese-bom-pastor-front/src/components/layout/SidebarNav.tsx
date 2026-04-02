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
}

export function SidebarNav({ items, pathname }: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {items.map(({ label, to, icon: Icon }) => (
        <Button key={to} variant={pathname === to ? "navActive" : "nav"} className="w-full justify-start" asChild>
          <Link to={to}>
            <Icon className="mr-3 h-4 w-4" />
            {label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
