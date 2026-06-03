"use client";

import { useTheme } from "@/providers/theme-provider";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycle() {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme("system");
    }
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
        className
      )}
      aria-label={`Theme: ${theme}. Click to cycle.`}
    >
      {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
