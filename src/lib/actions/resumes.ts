"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { z } from "zod";

// --- Validation ---

const resumeCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  fileUrl: z.string().url("Must be a valid URL").max(500),
});

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// --- Resume CRUD ---

export async function listResumes() {
  const user = await requireUser();
  return prisma.resumeVersion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createResume(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const raw = {
    name: String(formData.get("name") ?? ""),
    fileUrl: String(formData.get("fileUrl") ?? ""),
  };
  const parsed = resumeCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const resume = await prisma.resumeVersion.create({
    data: { userId: user.id, name: parsed.data.name, fileUrl: parsed.data.fileUrl },
  });
  return { ok: true, id: resume.id };
}

export async function deleteResume(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const resume = await prisma.resumeVersion.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return { ok: false, error: "Resume not found." };
  }
  // Unlink any applications first
  await prisma.$executeRaw`
    UPDATE "Application" SET "resumeVersionId" = NULL WHERE "resumeVersionId" = ${id}
  `;
  await prisma.resumeVersion.delete({ where: { id } });
  return { ok: true };
}

// --- Contact / Cover Letter fields (raw SQL since Prisma types don't include P2 columns) ---

// Helper: verify application ownership
async function verifyAppOwnership(applicationId: string, userId: string) {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.userId !== userId) return false;
  return true;
}

const contactOnlySchema = z.object({
  contactName: z.string().max(120).nullable().optional(),
  contactEmail: z.string().email("Invalid email").max(255).nullable().optional(),
  contactPhone: z.string().max(40).nullable().optional(),
});

export async function updateContactOnly(
  applicationId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await verifyAppOwnership(applicationId, user.id))) {
    return { ok: false, error: "Application not found." };
  }

  const raw = {
    contactName: formData.get("contactName") || null,
    contactEmail: formData.get("contactEmail") || null,
    contactPhone: formData.get("contactPhone") || null,
  };

  const parsed = contactOnlySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  await prisma.$executeRaw`
    UPDATE "Application"
    SET "contactName" = ${d.contactName ?? null},
        "contactEmail" = ${d.contactEmail ?? null},
        "contactPhone" = ${d.contactPhone ?? null},
        "lastUpdated" = NOW()
    WHERE "id" = ${applicationId}
  `;

  return { ok: true };
}

export async function updateCoverLetter(
  applicationId: string,
  content: string | null
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await verifyAppOwnership(applicationId, user.id))) {
    return { ok: false, error: "Application not found." };
  }

  await prisma.$executeRaw`
    UPDATE "Application"
    SET "coverLetter" = ${content},
        "lastUpdated" = NOW()
    WHERE "id" = ${applicationId}
  `;

  return { ok: true };
}

export async function updateResumeLink(
  applicationId: string,
  resumeVersionId: string | null
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await verifyAppOwnership(applicationId, user.id))) {
    return { ok: false, error: "Application not found." };
  }

  await prisma.$executeRaw`
    UPDATE "Application"
    SET "resumeVersionId" = ${resumeVersionId},
        "lastUpdated" = NOW()
    WHERE "id" = ${applicationId}
  `;

  return { ok: true };
}

export async function getApplicationP2Fields(applicationId: string) {
  const user = await requireUser();
  const rows = (await prisma.$queryRaw`
    SELECT "contactName", "contactEmail", "contactPhone", "coverLetter", "resumeVersionId"
    FROM "Application"
    WHERE "id" = ${applicationId} AND "userId" = ${user.id}
  `) as Array<{
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    coverLetter: string | null;
    resumeVersionId: string | null;
  }>;
  return rows[0] ?? null;
}
