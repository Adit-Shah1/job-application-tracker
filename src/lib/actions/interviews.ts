"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { z } from "zod";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const interviewRoundSchema = z.object({
  roundNumber: z.coerce.number().int().min(1).max(50),
  type: z.enum(["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "ONSITE", "FINAL", "OTHER"]),
  interviewerName: z.string().max(120).nullable().optional(),
  interviewerEmail: z.string().email().max(255).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  feedback: z.string().max(5000).nullable().optional(),
  outcome: z.enum(["PENDING", "PASSED", "FAILED", "NO_SHOW"]).nullable().optional(),
});

export type InterviewRoundType = "PHONE_SCREEN" | "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "ONSITE" | "FINAL" | "OTHER";
export type InterviewOutcome = "PENDING" | "PASSED" | "FAILED" | "NO_SHOW" | null;

export type InterviewRoundRow = {
  id: string;
  applicationId: string;
  roundNumber: number;
  type: string;
  interviewerName: string | null;
  interviewerEmail: string | null;
  scheduledAt: Date | null;
  notes: string | null;
  feedback: string | null;
  outcome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  SYSTEM_DESIGN: "System Design",
  ONSITE: "Onsite",
  FINAL: "Final",
  OTHER: "Other",
};

const OUTCOME_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PASSED: "Passed",
  FAILED: "Failed",
  NO_SHOW: "No Show",
};

export { INTERVIEW_TYPE_LABELS, OUTCOME_LABELS };

export async function listInterviewRounds(applicationId: string): Promise<InterviewRoundRow[]> {
  const user = await requireUser();
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.userId !== user.id) return [];

  const rows = (await prisma.$queryRaw`
    SELECT * FROM "InterviewRound"
    WHERE "applicationId" = ${applicationId}
    ORDER BY "roundNumber" ASC, "scheduledAt" ASC NULLS LAST
  `) as InterviewRoundRow[];
  return rows;
}

export async function createInterviewRound(
  applicationId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.userId !== user.id) {
    return { ok: false, error: "Application not found." };
  }

  const raw = {
    roundNumber: formData.get("roundNumber") ?? "1",
    type: formData.get("type") ?? "TECHNICAL",
    interviewerName: formData.get("interviewerName") || null,
    interviewerEmail: formData.get("interviewerEmail") || null,
    scheduledAt: formData.get("scheduledAt") || null,
    notes: formData.get("notes") || null,
    feedback: formData.get("feedback") || null,
    outcome: formData.get("outcome") || "PENDING",
  };

  const parsed = interviewRoundSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  const rows = (await prisma.$queryRaw`
    INSERT INTO "InterviewRound" ("applicationId", "roundNumber", "type", "interviewerName", "interviewerEmail", "scheduledAt", "notes", "feedback", "outcome")
    VALUES (${applicationId}, ${d.roundNumber}, ${d.type}, ${d.interviewerName ?? null}, ${d.interviewerEmail ?? null}, ${d.scheduledAt ? new Date(d.scheduledAt) : null}, ${d.notes ?? null}, ${d.feedback ?? null}, ${d.outcome ?? "PENDING"})
    RETURNING "id"
  `) as Array<{ id: string }>;

  return { ok: true, id: rows[0]?.id };
}

export async function updateInterviewRound(
  roundId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  // Verify ownership through application
  const rounds = (await prisma.$queryRaw`
    SELECT r."applicationId", a."userId" FROM "InterviewRound" r
    JOIN "Application" a ON a."id" = r."applicationId"
    WHERE r."id" = ${roundId}
  `) as Array<{ applicationId: string; userId: string }>;

  if (!rounds.length || rounds[0].userId !== user.id) {
    return { ok: false, error: "Interview round not found." };
  }

  const raw = {
    roundNumber: formData.get("roundNumber") ?? "1",
    type: formData.get("type") ?? "TECHNICAL",
    interviewerName: formData.get("interviewerName") || null,
    interviewerEmail: formData.get("interviewerEmail") || null,
    scheduledAt: formData.get("scheduledAt") || null,
    notes: formData.get("notes") || null,
    feedback: formData.get("feedback") || null,
    outcome: formData.get("outcome") || "PENDING",
  };

  const parsed = interviewRoundSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  await prisma.$executeRaw`
    UPDATE "InterviewRound"
    SET "roundNumber" = ${d.roundNumber}, "type" = ${d.type},
        "interviewerName" = ${d.interviewerName ?? null}, "interviewerEmail" = ${d.interviewerEmail ?? null},
        "scheduledAt" = ${d.scheduledAt ? new Date(d.scheduledAt) : null},
        "notes" = ${d.notes ?? null}, "feedback" = ${d.feedback ?? null}, "outcome" = ${d.outcome ?? "PENDING"},
        "updatedAt" = NOW()
    WHERE "id" = ${roundId}
  `;

  return { ok: true };
}

export async function deleteInterviewRound(roundId: string): Promise<ActionResult> {
  const user = await requireUser();

  const rounds = (await prisma.$queryRaw`
    SELECT r."id" FROM "InterviewRound" r
    JOIN "Application" a ON a."id" = r."applicationId"
    WHERE r."id" = ${roundId} AND a."userId" = ${user.id}
  `) as Array<{ id: string }>;

  if (!rounds.length) {
    return { ok: false, error: "Interview round not found." };
  }

  await prisma.$executeRaw`DELETE FROM "InterviewRound" WHERE "id" = ${roundId}`;
  return { ok: true };
}
