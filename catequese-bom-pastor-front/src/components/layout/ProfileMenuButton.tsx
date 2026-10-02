import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { LogOut, UserRound } from "lucide-react";

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

export function ProfileMenuButton() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<{ nome: string; fotoUrl: string | null } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    let active = true;
    const loadProfile = async () => {
      try {
        const response = await api.get(API_ROUTES.auth.me);
        if (!response.ok) return;
        const result = await response.json();
        if (active) setProfile({ nome: result.nome || user?.nome || "", fotoUrl: result.fotoUrl || null });
      } catch {
        // Keep the initials fallback when the profile endpoint is unavailable.
      }
    };

    void loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => {
      active = false;
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [isAuthenticated, location.pathname, user?.id, user?.nome]);

  if (!isAuthenticated) return null;

  const displayName = profile?.nome || user?.nome || "Meu perfil";
  const roleName = role === "admin" ? "Administrador" : role === "catequista" ? "Catequista" : "Responsável";

  return (
    <div className="fixed right-4 top-3 z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-border bg-card p-0 shadow-sm"
            aria-label="Abrir menu do perfil"
            title="Meu perfil"
          >
            <Avatar className="h-9 w-9">
              {profile?.fotoUrl && <AvatarImage src={profile.fotoUrl} alt={`Foto de ${displayName}`} />}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="font-normal">
            <span className="block truncate font-medium">{displayName}</span>
            <span className="block text-xs text-muted-foreground">{roleName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/perfil" className="flex cursor-pointer items-center">
              <UserRound className="mr-2 h-4 w-4" /> Meu perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={logout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}