"use client";

import { useTheme } from "@/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose your theme preference.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm transition-all",
                theme === value
                  ? "border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              )}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
