"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { noteSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/applications";

async function assertOwnsApplication(applicationId: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  });
  if (!app || app.userId !== userId) {
    return false;
  }
  return true;
}

export async function createNote(
  applicationId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await assertOwnsApplication(applicationId, user.id))) {
    return { ok: false, error: "Application not found." };
  }
  const parsed = noteSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const note = await prisma.note.create({
    data: {
      applicationId,
      content: parsed.data.content,
    },
  });
  revalidatePath(`/applications/${applicationId}`);
  updateTag("applications");
  return { ok: true, id: note.id };
}

export async function updateNote(
  noteId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { application: { select: { userId: true, id: true } } },
  });
  if (!note || note.application.userId !== user.id) {
    return { ok: false, error: "Note not found." };
  }
  const parsed = noteSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  await prisma.note.update({
    where: { id: noteId },
    data: { content: parsed.data.content },
  });
  revalidatePath(`/applications/${note.application.id}`);
  updateTag("applications");
  return { ok: true };
}

export async function deleteNote(noteId: string): Promise<ActionResult> {
  const user = await requireUser();
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { application: { select: { userId: true, id: true } } },
  });
  if (!note || note.application.userId !== user.id) {
    return { ok: false, error: "Note not found." };
  }
  await prisma.note.delete({ where: { id: noteId } });
  revalidatePath(`/applications/${note.application.id}`);
  updateTag("applications");
  return { ok: true };
}
