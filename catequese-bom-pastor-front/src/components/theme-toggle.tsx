import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      className="fixed right-16 top-2 z-[60] h-11 w-11 rounded-full border border-border bg-card px-3 text-foreground shadow-lg transition-[width,transform] hover:scale-105 sm:right-4 sm:w-auto sm:gap-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={isDark}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
      <span className="hidden text-xs font-semibold sm:inline">
        {isDark ? "Modo claro" : "Modo escuro"}
      </span>
    </Button>
  );
}