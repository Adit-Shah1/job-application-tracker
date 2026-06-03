"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  signInWithProvider,
  unlinkProvider,
  type UnlinkResult,
} from "@/lib/actions/account";

type ProviderId = "github" | "google";

const PROVIDERS: Array<{
  id: ProviderId;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = [
  {
    id: "github",
    label: "GitHub",
    color: "from-zinc-700 to-zinc-900",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    id: "google",
    label: "Google",
    color: "from-sky-500 to-emerald-500",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M21.35 11.1H12v2.97h5.34c-.23 1.5-1.66 4.4-5.34 4.4-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.77 4.07 14.6 3.1 12 3.1 6.92 3.1 2.85 7.17 2.85 12.25s4.07 9.15 9.15 9.15c5.28 0 8.77-3.71 8.77-8.93 0-.6-.07-1.06-.17-1.47z" />
      </svg>
    ),
  },
];

export function ConnectedProvidersCard({
  linkedProviders,
  enabledProviders,
  hasPassword = false,
}: {
  linkedProviders: ProviderId[];
  enabledProviders: { github: boolean; google: boolean };
  hasPassword?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [unlinkTarget, setUnlinkTarget] = useState<ProviderId | null>(null);
  const [state, formAction, pending] = useActionState<UnlinkResult | null, FormData>(
    unlinkProvider,
    null
  );

  const isLastProvider = linkedProviders.length <= 1 && !hasPassword;
  const linkedSet = new Set(linkedProviders);

  if (state?.ok && unlinkTarget) {
    toast({
      title: `${labelFor(unlinkTarget)} disconnected`,
      description: "You can reconnect it anytime from this page.",
    });
    setUnlinkTarget(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected providers</CardTitle>
        <CardDescription>
          Sign-in methods linked to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {PROVIDERS.map((p) => {
            const linked = linkedSet.has(p.id);
            const enabled = enabledProviders[p.id];
            const cannotUnlink = linked && isLastProvider;
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-white/60 px-3 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/60"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${p.color} text-white shadow-sm`}
                    aria-hidden="true"
                  >
                    {p.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-zinc-500">
                      {linked
                        ? "Linked"
                        : enabled
                          ? "Not connected"
                          : "Not configured"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {linked ? (
                    <Badge variant="success">Connected</Badge>
                  ) : enabled ? (
                    <Badge variant="muted">Available</Badge>
                  ) : (
                    <Badge variant="muted">Unavailable</Badge>
                  )}
                  {linked ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUnlinkTarget(p.id)}
                      disabled={cannotUnlink}
                      title={
                        cannotUnlink
                          ? "Set a password or connect another provider before disconnecting this one."
                          : undefined
                      }
                    >
                      Disconnect
                    </Button>
                  ) : enabled ? (
                    <form action={signInWithProvider}>
                      <input type="hidden" name="provider" value={p.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Connect
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <UnlinkDialog
        target={unlinkTarget}
        state={state}
        pending={pending}
        formAction={formAction}
        onClose={() => setUnlinkTarget(null)}
      />
    </Card>
  );
}

function UnlinkDialog({
  target,
  state,
  pending,
  formAction,
  onClose,
}: {
  target: ProviderId | null;
  state: UnlinkResult | null;
  pending: boolean;
  formAction: (fd: FormData) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect {target ? labelFor(target) : "provider"}?</DialogTitle>
          <DialogDescription>
            You won&apos;t be able to sign in with{" "}
            {target ? labelFor(target) : "this provider"} anymore. Make sure
            you have another way to sign in before disconnecting your only
            method.
          </DialogDescription>
        </DialogHeader>
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
          <form action={formAction}>
            <input type="hidden" name="provider" value={target ?? ""} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Disconnecting…" : "Disconnect"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function labelFor(id: ProviderId): string {
  return PROVIDERS.find((p) => p.id === id)?.label ?? id;
}
