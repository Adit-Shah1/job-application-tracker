"use client";

import { fromNow } from "@/lib/dates";
import { STATUS_LABELS, STATUS_BADGE_VARIANT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/generated/prisma/client";

type StatusChange = {
  id: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  createdAt: Date;
};

const STATUS_DOT: Record<ApplicationStatus, string> = {
  SAVED: "bg-zinc-400",
  APPLIED: "bg-sky-500",
  INTERVIEWING: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-zinc-500",
};

export function StatusTimeline({ changes }: { changes: StatusChange[] }) {
  if (changes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No status changes yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {changes.map((change, i) => (
        <li key={change.id} className="flex items-start gap-3">
          <div className="relative flex flex-col items-center">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${STATUS_DOT[change.toStatus]}`}
            />
            {i < changes.length - 1 && (
              <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800" style={{ minHeight: 20 }} />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <Badge variant={STATUS_BADGE_VARIANT[change.fromStatus]} className="text-[11px]">
                {STATUS_LABELS[change.fromStatus]}
              </Badge>
              <span className="text-zinc-400">→</span>
              <Badge variant={STATUS_BADGE_VARIANT[change.toStatus]} className="text-[11px]">
                {STATUS_LABELS[change.toStatus]}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {fromNow(change.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
