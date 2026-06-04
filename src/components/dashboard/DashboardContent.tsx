import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { ButtonLink } from "@/components/ui/button-link";
import { getDashboardSummary } from "@/lib/queries";
import { StatusChartClient } from "./StatusChartClient";
import { PipelineFunnelClient } from "./PipelineFunnelClient";
import { fromNow, isOverdue, friendlyDate } from "@/lib/dates";
import { REMINDER_TYPE_LABELS } from "@/lib/constants";
import {
  Briefcase,
  Activity,
  Users,
  Trophy,
  Plus,
  ArrowRight,
  Bell,
  CheckCircle2,
  Sparkles,
  Timer,
} from "lucide-react";

export async function DashboardContent() {
  const summary = await getDashboardSummary();
  const noData = summary.total === 0;

  if (noData) {
    return (
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-violet-500/[0.04] to-transparent"
          aria-hidden="true"
        />
        <CardContent className="relative flex flex-col items-center justify-center gap-3 p-16 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-4 ring-1 ring-indigo-500/10">
            <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold">Welcome to your tracker</h3>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Add your first application to see stats, reminders, and progress
            here.
          </p>
          <ButtonLink href="/applications/new" className="mt-1">
            <Plus size={15} /> Add your first application
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatCard
          label="Total"
          value={summary.total}
          icon={<Briefcase className="h-4 w-4" />}
          accent="from-sky-500/10 to-sky-500/0"
        />
        <StatCard
          label="Active"
          value={summary.active}
          icon={<Activity className="h-4 w-4" />}
          accent="from-amber-500/10 to-amber-500/0"
        />
        <StatCard
          label="Interviewing"
          value={summary.interviewing}
          icon={<Users className="h-4 w-4" />}
          accent="from-violet-500/10 to-violet-500/0"
        />
        <StatCard
          label="Offers"
          value={summary.offers}
          icon={<Trophy className="h-4 w-4" />}
          accent="from-emerald-500/10 to-emerald-500/0"
        />
        <StatCard
          label="Avg Response"
          value={summary.avgResponseDays !== null ? summary.avgResponseDays : "—"}
          suffix={summary.avgResponseDays !== null ? "days" : undefined}
          icon={<Timer className="h-4 w-4" />}
          accent="from-cyan-500/10 to-cyan-500/0"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications by status</CardTitle>
            <CardDescription>
              Where your pipeline stands right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChartClient data={summary.byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline funnel</CardTitle>
            <CardDescription>
              Conversion rates between stages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineFunnelClient data={summary.funnel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming reminders</CardTitle>
            <CardDescription>
              Next 14 days, ordered by date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.upcomingReminders.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No upcoming reminders. You&apos;re all caught up.
              </p>
            ) : (
              <ul className="stagger space-y-2">
                {summary.upcomingReminders.map((r) => {
                  const overdue = isOverdue(r.reminderDate);
                  return (
                    <li
                      key={r.id}
                      className={
                        overdue
                          ? "rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-2.5 text-sm transition-all duration-150 hover:shadow-sm dark:border-red-900/40 dark:from-red-950/30 dark:to-red-950/10"
                          : "rounded-lg border border-zinc-200/80 bg-white/80 p-2.5 text-sm transition-all duration-150 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-zinc-700"
                      }
                    >
                      <Link
                        href={`/applications/${r.application.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <Bell
                            size={12}
                            className={
                              overdue ? "text-red-600" : "text-zinc-500"
                            }
                          />
                          {r.application.companyName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {REMINDER_TYPE_LABELS[r.reminderType as keyof typeof REMINDER_TYPE_LABELS]} ·{" "}
                          {friendlyDate(r.reminderDate)} · {fromNow(r.reminderDate)}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recently updated</CardTitle>
              <CardDescription>Your most recent activity.</CardDescription>
            </div>
            <ButtonLink href="/applications" variant="ghost" size="sm">
              View all <ArrowRight size={14} />
            </ButtonLink>
          </CardHeader>
          <CardContent>
            <ul className="stagger divide-y divide-zinc-100 dark:divide-zinc-900">
              {summary.recentlyUpdated.map((app) => (
                <li
                  key={app.id}
                  className="group flex items-center justify-between py-2.5 text-sm"
                >
                  <Link
                    href={`/applications/${app.id}`}
                    className="flex items-center gap-2 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-zinc-400"
                    />
                    <span className="font-medium">{app.companyName}</span>
                    <span className="text-zinc-500">— {app.roleTitle}</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <span className="hidden text-xs text-zinc-500 sm:inline">
                      {fromNow(app.lastUpdated)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  suffix?: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-900/[0.04]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
        aria-hidden="true"
      />
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-medium uppercase tracking-wide">{label}</span>
          <span className="text-zinc-400 transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-zinc-500">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
