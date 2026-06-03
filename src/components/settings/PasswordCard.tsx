"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  setPassword,
  changePassword,
  removePassword,
  type PasswordResult,
} from "@/lib/actions/account";
import { Key, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Mode = "set" | "change" | "remove";

const actionMap: Record<Mode, typeof setPassword> = {
  set: setPassword,
  change: changePassword,
  remove: removePassword,
};

export function PasswordCard({
  hasPassword,
  hasOAuth,
}: {
  hasPassword: boolean;
  hasOAuth: boolean;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [open, setOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  function openDialog(m: Mode) {
    setMode(m);
    setOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleClose() {
    setMode(null);
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Manage your password-based sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Key size={14} className="text-zinc-500" />
            <span>
              {hasPassword ? "Password is set" : "No password set"}
            </span>
            <Badge variant={hasPassword ? "success" : "muted"}>
              {hasPassword ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex gap-2">
            {hasPassword ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog("change")}
                >
                  Change password
                </Button>
                {hasOAuth && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog("remove")}
                  >
                    Remove password
                  </Button>
                )}
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openDialog("set")}
              >
                Set password
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {mode && (
        <PasswordFormDialog
          key={dialogKey}
          mode={mode}
          open={open}
          onClose={handleClose}
        />
      )}
    </Card>
  );
}

function PasswordFormDialog({
  mode,
  open,
  onClose,
}: {
  mode: Mode;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState<PasswordResult | null, FormData>(
    actionMap[mode],
    null
  );

  useEffect(() => {
    if (!state?.ok) return;
    const message =
      mode === "set"
        ? "Password set"
        : mode === "change"
          ? "Password changed"
          : "Password removed";
    toast({ title: message });
    router.refresh();
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "set"
              ? "Set password"
              : mode === "change"
                ? "Change password"
                : "Remove password?"}
          </DialogTitle>
          <DialogDescription>
            {mode === "set" &&
              "You'll be able to sign in with email and password."}
            {mode === "change" &&
              "Your current password will be replaced."}
            {mode === "remove" &&
              "You'll need an OAuth provider to sign in after removing your password."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          {mode === "change" && (
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
              />
              {fieldErrors.currentPassword && (
                <p className="text-xs text-red-600">
                  {fieldErrors.currentPassword[0]}
                </p>
              )}
            </div>
          )}

          {mode !== "remove" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {mode === "set" ? "Password" : "New password"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={pending}
                  minLength={8}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.password[0]}
                  </p>
                )}
                {mode !== "change" && (
                  <p className="text-xs text-zinc-500">
                    At least 8 characters.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={pending}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </div>
            </>
          )}

          {state && !state.ok && !Object.keys(fieldErrors).length && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 size={14} className="animate-spin" />}
              {pending
                ? mode === "set"
                  ? "Setting…"
                  : mode === "change"
                    ? "Changing…"
                    : "Removing…"
                : mode === "set"
                  ? "Set password"
                  : mode === "change"
                    ? "Change password"
                    : "Remove password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
