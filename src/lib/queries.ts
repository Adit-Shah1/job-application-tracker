import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDay, addDays, differenceInDays } from "date-fns";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/constants";

export type FunnelStage = {
  label: string;
  count: number;
  rate: number; // percentage from previous stage
};

export type DashboardSummary = {
  total: number;
  active: number;
  interviewing: number;
  offers: number;
  avgResponseDays: number | null;
  byStatus: Record<ApplicationStatus, number>;
  funnel: FunnelStage[];
  upcomingReminders: Array<{
    id: string;
    reminderDate: Date;
    reminderType: string;
    application: { id: string; companyName: string; roleTitle: string };
  }>;
  recentlyUpdated: Array<{
    id: string;
    companyName: string;
    roleTitle: string;
    status: ApplicationStatus;
    lastUpdated: Date;
  }>;
};

async function loadDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [all, byStatusRaw, upcoming, recent] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.reminder.findMany({
      where: {
        application: { userId },
        completed: false,
        reminderDate: { lte: addDays(new Date(), 14) },
      },
      orderBy: { reminderDate: "asc" },
      take: 5,
      include: {
        application: {
          select: { id: true, companyName: true, roleTitle: true },
        },
      },
    }),
    prisma.application.findMany({
      where: { userId },
      orderBy: { lastUpdated: "desc" },
      take: 5,
      select: {
        id: true,
        companyName: true,
        roleTitle: true,
        status: true,
        lastUpdated: true,
      },
    }),
  ]);

  const byStatus = APPLICATION_STATUSES.reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );
  for (const row of byStatusRaw) {
    byStatus[row.status] = row._count._all;
  }

  // --- Funnel: count apps that ever reached each stage ---
  const funnelStages: ApplicationStatus[] = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER"];
  const everReached = await Promise.all(
    funnelStages.map((s) =>
      prisma.application.count({
        where: {
          userId,
          OR: [
            { status: s },
            { statusChanges: { some: { toStatus: s } } },
          ],
        },
      })
    )
  );

  const stageLabels = ["Saved", "Applied", "Interviewing", "Offer"];
  const funnel: FunnelStage[] = funnelStages.map((_, i) => ({
    label: stageLabels[i],
    count: everReached[i],
    rate: i === 0 ? 100 : everReached[i - 1] > 0 ? Math.round((everReached[i] / everReached[i - 1]) * 100) : 0,
  }));

  // --- Avg response time (days from save to first status change away from SAVED) ---
  const responseTimes = await prisma.$queryRaw<{ days: number }[]>`
    SELECT AVG(EXTRACT(EPOCH FROM (sc."createdAt" - a."dateSaved")) / 86400)::int AS days
    FROM "Application" a
    JOIN LATERAL (
      SELECT "createdAt" FROM "StatusChange"
      WHERE "applicationId" = a."id" AND "toStatus" != 'SAVED'
      ORDER BY "createdAt" ASC LIMIT 1
    ) sc ON true
    WHERE a."userId" = ${userId}
  `;
  const avgResponseDays = responseTimes[0]?.days ?? null;

  return {
    total: all,
    active:
      byStatus.SAVED + byStatus.APPLIED + byStatus.INTERVIEWING,
    interviewing: byStatus.INTERVIEWING,
    offers: byStatus.OFFER,
    avgResponseDays,
    byStatus,
    funnel,
    upcomingReminders: upcoming,
    recentlyUpdated: recent,
  };
}

const cachedDashboard = unstable_cache(
  async (userId: string) => loadDashboardSummary(userId),
  ["dashboard-summary"],
  { revalidate: 30, tags: ["dashboard"] }
);

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await requireUser();
  return cachedDashboard(user.id);
}

async function loadApplicationDetail(userId: string, id: string) {
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      reminders: { orderBy: { reminderDate: "asc" } },
      emailDrafts: { orderBy: { updatedAt: "desc" } },
      statusChanges: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!app || app.userId !== userId) return null;
  return app;
}

const cachedApplicationDetail = unstable_cache(
  async (userId: string, id: string) => loadApplicationDetail(userId, id),
  ["application-detail"],
  { revalidate: 30, tags: ["applications", "email-drafts"] }
);

export async function getApplicationDetail(id: string) {
  const user = await requireUser();
  return cachedApplicationDetail(user.id, id);
}

export async function getOverdueRemindersCount(): Promise<number> {
  const user = await requireUser();
  return prisma.reminder.count({
    where: {
      application: { userId: user.id },
      completed: false,
      reminderDate: { lt: startOfDay(new Date()) },
    },
  });
}
