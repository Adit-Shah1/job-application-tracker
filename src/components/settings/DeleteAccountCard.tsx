"use client";

import { useActionState, useState } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import {
  deleteAccount,
  type DeleteAccountResult,
} from "@/lib/actions/account";

export function DeleteAccountCard({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, pending] = useActionState<
    DeleteAccountResult | null,
    FormData
  >(deleteAccount, null);

  const matches = confirmation.trim().toLowerCase() === email.toLowerCase();

  return (
    <Card className="border-red-200 dark:border-red-900/50">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-400">
          Danger zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all of your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          This will delete your account, all of your job applications, notes,
          reminders, email drafts, and connected sign-in methods.{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            This cannot be undone.
          </span>
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setConfirmation("");
            setOpen(true);
          }}
        >
          <Trash2 size={14} />
          Delete account
        </Button>
      </CardContent>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && pending) return;
          setOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Type your email{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {email}
              </span>{" "}
              below to confirm. This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirmation">Confirm email</Label>
              <Input
                id="delete-confirmation"
                name="confirmation"
                type="email"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={email}
                disabled={pending}
                required
              />
            </div>
            {state && !state.ok && (
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
              <Button
                type="submit"
                variant="destructive"
                disabled={pending || !matches}
              >
                {pending ? "Deleting…" : "Delete account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
