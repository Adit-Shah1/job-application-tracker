import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { listApplications } from "@/lib/actions/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/dates";
import { APPLICATION_STATUSES, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import {
  ArrowLeft,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import type { ApplicationStatus, Priority } from "@/generated/prisma/client";

export const metadata = { title: "Compare Offers · Job Tracker" };

export default async function ComparePage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <ButtonLink href="/applications" variant="ghost" size="sm" className="-ml-2 mb-2">
          <ArrowLeft size={14} /> Back to applications
        </ButtonLink>
        <h1 className="text-2xl font-semibold tracking-tight">Compare Offers</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Side-by-side comparison of your offer-stage applications.
        </p>
      </div>
      <Suspense fallback={<CompareSkeleton />}>
        <CompareContent />
      </Suspense>
    </div>
  );
}

async function CompareContent() {
  const result = await listApplications({ status: "OFFER", pageSize: 100 });
  const offers = result.data;

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <Briefcase className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <h3 className="text-lg font-semibold">No offers yet</h3>
          <p className="max-w-sm text-sm text-zinc-500">
            When you receive offers, they&apos;ll appear here for side-by-side comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="p-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Field</th>
            {offers.map((offer) => (
              <th key={offer.id} className="p-3 text-left">
                <a
                  href={`/applications/${offer.id}`}
                  className="text-sm font-semibold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                >
                  {offer.companyName}
                </a>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{offer.roleTitle}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          <CompareRow label="Salary Range" icon={<DollarSign size={14} />}>
            {offers.map((o) => {
              const salary =
                o.salaryMin || o.salaryMax
                  ? `${o.currency ?? ""} ${o.salaryMin?.toLocaleString() ?? "?"} – ${o.salaryMax?.toLocaleString() ?? "?"}`
                  : "—";
              return <td key={o.id} className="p-3 text-zinc-700 dark:text-zinc-300">{salary}</td>;
            })}
          </CompareRow>
          <CompareRow label="Location" icon={<MapPin size={14} />}>
            {offers.map((o) => (
              <td key={o.id} className="p-3 text-zinc-700 dark:text-zinc-300">{o.location ?? "—"}</td>
            ))}
          </CompareRow>
          <CompareRow label="Priority" icon={null}>
            {offers.map((o) => (
              <td key={o.id} className="p-3">
                <Badge variant={o.priority === "HIGH" ? "danger" : o.priority === "MEDIUM" ? "warning" : "muted"}>
                  {PRIORITY_LABELS[o.priority]}
                </Badge>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Date Applied" icon={<Calendar size={14} />}>
            {offers.map((o) => (
              <td key={o.id} className="p-3 text-zinc-700 dark:text-zinc-300">
                {o.dateApplied ? formatDate(o.dateApplied) : "—"}
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Source" icon={null}>
            {offers.map((o) => (
              <td key={o.id} className="p-3 text-zinc-700 dark:text-zinc-300">{o.source ?? "—"}</td>
            ))}
          </CompareRow>
          <CompareRow label="Notes" icon={<FileText size={14} />}>
            {offers.map((o) => (
              <td key={o.id} className="p-3 text-zinc-700 dark:text-zinc-300">{o._count.notes}</td>
            ))}
          </CompareRow>
          <CompareRow label="Job URL" icon={<ExternalLink size={14} />}>
            {offers.map((o) => (
              <td key={o.id} className="p-3">
                {o.jobUrl ? (
                  <a
                    href={o.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View posting
                  </a>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </td>
            ))}
          </CompareRow>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/30">
      <td className="p-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {icon} {label}
        </div>
      </td>
      {children}
    </tr>
  );
}

function CompareSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}
