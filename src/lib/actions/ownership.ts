"use server";

import { prisma } from "@/lib/db";

export async function assertOwnsApplication(
  applicationId: string,
  userId: string
): Promise<boolean> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  });
  return !!app && app.userId === userId;
}
