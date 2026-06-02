import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/constants";
import type { ApplicationStatus } from "@/generated/prisma/client";

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <Link
      href={`/applications?status=${status}`}
      className="inline-flex items-center rounded-md border border-transparent bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
    >
      {STATUS_LABELS[status]}
    </Link>
  );
}
