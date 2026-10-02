import logoParoquia from "@/assets/logo-paroquia.jpg";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, Heart, Home, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Início", href: "/", icon: Home },
    { label: "Sobre", href: "/sobre", icon: BookOpen },
    { label: "Lojinha", href: "/lojinha", icon: Heart },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.replace("/#", "/"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img
            src={logoParoquia}
            alt="Logo Paróquia"
            className="h-10 w-10 rounded-full object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="font-display text-lg font-semibold text-foreground">
              Portal de Catequese
            </h1>
            <p className="text-xs text-muted-foreground">
              Crescendo na verdadeira Fé
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={isActive(item.href) ? "navActive" : "nav"}
              size="sm"
              asChild
            >
              <Link to={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="animate-slide-up border-t bg-card md:hidden">
          <nav className="container flex flex-col gap-2 px-4 py-4 pr-16">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={isActive(item.href) ? "navActive" : "nav"}
                className="justify-start"
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              <ThemeToggle />
              <Button variant="outline" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
