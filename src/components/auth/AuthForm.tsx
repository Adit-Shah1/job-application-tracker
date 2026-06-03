"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signUpWithEmail } from "@/lib/actions/account";
import type { AuthResult } from "@/lib/actions/account";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";

type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);

  const action = mode === "signin" ? signInWithEmail : signUpWithEmail;
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    action,
    null
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg border border-zinc-200/80 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === "signin"
              ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            mode === "signup"
              ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Sign up
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600">{fieldErrors.name[0]}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              autoComplete="email"
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-600">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              className="pl-9 pr-9"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600">{fieldErrors.password[0]}</p>
          )}
          {mode === "signup" && (
            <p className="text-xs text-zinc-500">Must be at least 8 characters.</p>
          )}
        </div>

        {state && !state.ok && !Object.keys(fieldErrors).length && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending && <Loader2 size={15} className="animate-spin" />}
          {pending
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>
    </div>
  );
}
