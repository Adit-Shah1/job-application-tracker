"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  applicationCreateSchema,
  applicationUpdateSchema,
} from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createApplication(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const app = await prisma.application.create({
    data: {
      userId: user.id,
      companyName: data.companyName,
      roleTitle: data.roleTitle,
      jobUrl: data.jobUrl ?? null,
      location: data.location ?? null,
      status: data.status,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      currency: data.currency ?? null,
      dateApplied: data.dateApplied ?? null,
      priority: data.priority,
      source: data.source ?? null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true, id: app.id };
}

export async function updateApplication(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return { ok: false, error: "Application not found." };
  }
  const data = parsed.data;
  await prisma.application.update({
    where: { id },
    data: {
      companyName: data.companyName,
      roleTitle: data.roleTitle,
      jobUrl: data.jobUrl ?? null,
      location: data.location ?? null,
      status: data.status,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      currency: data.currency ?? null,
      dateApplied: data.dateApplied ?? null,
      priority: data.priority,
      source: data.source ?? null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true };
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const user = await requireUser();
  const validStatuses = [
    "SAVED",
    "APPLIED",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "ARCHIVED",
  ] as const;
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    return { ok: false, error: "Invalid status." };
  }
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return { ok: false, error: "Application not found." };
  }
  await prisma.application.update({
    where: { id },
    data: {
      status: status as (typeof validStatuses)[number],
      dateApplied:
        status === "APPLIED" && !existing.dateApplied
          ? new Date()
          : existing.dateApplied,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return { ok: false, error: "Application not found." };
  }
  await prisma.application.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  updateTag("dashboard");
  updateTag("applications");
  redirect("/applications");
}

export type ApplicationFilters = {
  status?: string;
  priority?: string;
  search?: string;
  sort?: "recent" | "oldest" | "company" | "status";
};

export async function listApplications(filters: ApplicationFilters = {}) {
  const user = await requireUser();
  const where: Prisma.ApplicationWhereInput = { userId: user.id };
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as Prisma.EnumApplicationStatusFilter["equals"];
  }
  if (filters.priority && filters.priority !== "ALL") {
    where.priority = filters.priority as Prisma.EnumPriorityFilter["equals"];
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { companyName: { contains: q, mode: "insensitive" } },
      { roleTitle: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }
  const orderBy: Prisma.ApplicationOrderByWithRelationInput =
    filters.sort === "oldest"
      ? { dateSaved: "asc" }
      : filters.sort === "company"
        ? { companyName: "asc" }
        : filters.sort === "status"
          ? { status: "asc" }
          : { lastUpdated: "desc" };

  return prisma.application.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { notes: true, reminders: true } },
    },
  });
}
