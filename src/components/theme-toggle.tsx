"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-xl border border-border bg-card/50 ${className ?? ""}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 cursor-pointer shadow-sm ${className ?? ""}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 animate-fade-in" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 animate-fade-in" />
      )}
    </button>
  );
}
