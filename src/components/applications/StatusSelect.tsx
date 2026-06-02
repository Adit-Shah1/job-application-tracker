"use client";

import { useTransition, useOptimistic, useRef } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { updateApplicationStatus } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/generated/prisma";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<ApplicationStatus, string> = {
  SAVED: "bg-zinc-400",
  APPLIED: "bg-sky-500",
  INTERVIEWING: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-zinc-500",
};

export function StatusSelect({
  applicationId,
  status,
  className,
}: {
  applicationId: string;
  status: ApplicationStatus;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const { toast } = useToast();
  const lastValue = useRef(status);

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <span
        className={cn(
          "pointer-events-none absolute left-2 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors duration-200",
          STATUS_DOT[optimisticStatus],
          pending && "animate-pulse-soft"
        )}
        aria-hidden="true"
      />
      <Select
        value={optimisticStatus}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ApplicationStatus;
          if (next === optimisticStatus) return;
          lastValue.current = optimisticStatus;
          setOptimisticStatus(next);
          startTransition(async () => {
            const res = await updateApplicationStatus(applicationId, next);
            if (!res.ok) {
              toast({
                title: "Couldn't update status",
                description: res.error,
                variant: "destructive",
              });
              setOptimisticStatus(lastValue.current);
            } else {
              router.refresh();
            }
          });
        }}
        className="min-w-[140px] pl-6"
      >
        {APPLICATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
