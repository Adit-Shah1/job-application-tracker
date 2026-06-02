import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { startOfDay, addDays } from "date-fns";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/constants";

export type DashboardSummary = {
  total: number;
  active: number;
  interviewing: number;
  offers: number;
  byStatus: Record<ApplicationStatus, number>;
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

  return {
    total: all,
    active:
      byStatus.SAVED + byStatus.APPLIED + byStatus.INTERVIEWING,
    interviewing: byStatus.INTERVIEWING,
    offers: byStatus.OFFER,
    byStatus,
    upcomingReminders: upcoming.map((r) => ({
      id: r.id,
      reminderDate: r.reminderDate,
      reminderType: r.reminderType,
      application: r.application,
    })),
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
