"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { reminderSchema } from "@/lib/validation";
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

export async function createReminder(
  applicationId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await assertOwnsApplication(applicationId, user.id))) {
    return { ok: false, error: "Application not found." };
  }
  const parsed = reminderSchema.safeParse({
    applicationId,
    reminderDate: formData.get("reminderDate"),
    reminderType: formData.get("reminderType"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const reminder = await prisma.reminder.create({
    data: {
      applicationId,
      reminderDate: parsed.data.reminderDate,
      reminderType: parsed.data.reminderType,
    },
  });
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true, id: reminder.id };
}

export async function completeReminder(reminderId: string): Promise<ActionResult> {
  const user = await requireUser();
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { application: { select: { id: true, userId: true } } },
  });
  if (!reminder || reminder.application.userId !== user.id) {
    return { ok: false, error: "Reminder not found." };
  }
  await prisma.reminder.update({
    where: { id: reminderId },
    data: { completed: true, completedAt: new Date() },
  });
  revalidatePath(`/applications/${reminder.application.id}`);
  revalidatePath("/dashboard");
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true };
}

export async function deleteReminder(reminderId: string): Promise<ActionResult> {
  const user = await requireUser();
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { application: { select: { id: true, userId: true } } },
  });
  if (!reminder || reminder.application.userId !== user.id) {
    return { ok: false, error: "Reminder not found." };
  }
  await prisma.reminder.delete({ where: { id: reminderId } });
  revalidatePath(`/applications/${reminder.application.id}`);
  revalidatePath("/dashboard");
  updateTag("dashboard");
  updateTag("applications");
  return { ok: true };
}
