"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { emailDraftSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/applications";

async function assertOwnsDraft(draftId: string, userId: string) {
  const draft = await prisma.emailDraft.findUnique({
    where: { id: draftId },
    include: { application: { select: { userId: true, id: true } } },
  });
  if (!draft || draft.application.userId !== userId) return null;
  return draft;
}

export async function saveEmailDraft(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const applicationId = formData.get("applicationId");
  const draftId = formData.get("draftId");
  const parsed = emailDraftSchema.safeParse({
    content: formData.get("content"),
    tone: formData.get("tone"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (typeof applicationId !== "string" || applicationId.length === 0) {
    return { ok: false, error: "Application not found." };
  }
  if (typeof draftId === "string" && draftId.length > 0) {
    const draft = await assertOwnsDraft(draftId, user.id);
    if (!draft) return { ok: false, error: "Draft not found." };
    await prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        content: parsed.data.content,
        tone: parsed.data.tone,
      },
    });
    revalidatePath(`/applications/${draft.application.id}`);
    updateTag("applications");
    updateTag("email-drafts");
    return { ok: true, id: draftId };
  }
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  });
  if (!app || app.userId !== user.id) {
    return { ok: false, error: "Application not found." };
  }
  const created = await prisma.emailDraft.create({
    data: {
      applicationId,
      content: parsed.data.content,
      tone: parsed.data.tone,
    },
  });
  revalidatePath(`/applications/${applicationId}`);
  updateTag("applications");
  updateTag("email-drafts");
  return { ok: true, id: created.id };
}

export async function deleteEmailDraft(draftId: string): Promise<ActionResult> {
  const user = await requireUser();
  const draft = await assertOwnsDraft(draftId, user.id);
  if (!draft) return { ok: false, error: "Draft not found." };
  await prisma.emailDraft.delete({ where: { id: draftId } });
  revalidatePath(`/applications/${draft.application.id}`);
  updateTag("applications");
  updateTag("email-drafts");
  return { ok: true };
}
