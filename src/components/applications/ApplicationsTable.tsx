import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusSelect } from "./StatusSelect";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDateShort } from "@/lib/dates";
import { PRIORITY_LABELS } from "@/lib/constants";
import { Briefcase, MapPin, Calendar, Plus, FileText, Bell } from "lucide-react";
import type { ApplicationStatus, Priority } from "@/generated/prisma/client";

type ApplicationRow = {
  id: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string | null;
  location: string | null;
  status: ApplicationStatus;
  priority: Priority;
  dateSaved: Date;
  dateApplied: Date | null;
  lastUpdated: Date;
  source: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  _count: { notes: number; reminders: number };
};

export function ApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  return (
    <>
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company / Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date saved</TableHead>
                  <TableHead className="text-right">Notes / Reminders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="stagger">
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="block font-medium text-zinc-950 transition-colors hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                      >
                        {app.companyName}
                      </Link>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {app.roleTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusSelect applicationId={app.id} status={app.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={app.priority} />
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {app.location ?? "—"}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                      {formatDateShort(app.dateSaved)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-3 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <FileText size={12} />
                          {app._count.notes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bell size={12} />
                          {app._count.reminders}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="stagger space-y-3 md:hidden">
        {applications.map((app) => (
          <Card
            key={app.id}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-900/[0.04]"
          >
            <CardContent className="space-y-3 p-4">
              <div>
                <Link
                  href={`/applications/${app.id}`}
                  className="font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {app.companyName}
                </Link>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {app.roleTitle}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusSelect applicationId={app.id} status={app.status} className="flex-1" />
                <PriorityBadge priority={app.priority} />
              </div>
              {app.location && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin size={12} />
                  {app.location}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} />
                  Saved {formatDateShort(app.dateSaved)}
                </span>
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <FileText size={12} />
                    {app._count.notes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bell size={12} />
                    {app._count.reminders}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function ApplicationsEmptyState() {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-violet-500/[0.04] to-transparent"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col items-center justify-center gap-3 p-16 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-4 ring-1 ring-indigo-500/10">
          <Briefcase className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold">No applications yet</h3>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Start tracking your job search. Add your first application to see it
          here.
        </p>
        <ButtonLink href="/applications/new" className="mt-1">
          <Plus size={15} /> Add application
        </ButtonLink>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const variant =
    priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "muted";
  return <Badge variant={variant}>{PRIORITY_LABELS[priority]}</Badge>;
}
