import { z } from "zod";
import { prisma } from "@/lib/db";
import { createAiRoute, streamResponse, formatNotes } from "@/lib/ai-route";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export const { POST } = createAiRoute(
  bodySchema,
  "next-steps",
  async ({ app, genai }) => {
    // Fetch reminders not included by the shared helper
    const reminders = await prisma.reminder.findMany({
      where: { applicationId: app.id, completed: false },
      orderBy: { reminderDate: "asc" },
      take: 5,
    });

    const model = genai.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction:
        "You are a concise career advisor assistant. Suggest 3-5 specific, actionable next steps " +
        "for a job application. Be practical and specific to the application's current status. " +
        "Number each step. Keep each to 1-2 sentences.",
    });

    const remindersBlock = reminders.length
      ? reminders
          .map((r) => `- ${r.reminderType} on ${r.reminderDate.toISOString().slice(0, 10)}`)
          .join("\n")
      : "No upcoming reminders.";

    const daysSinceUpdate = Math.floor(
      (Date.now() - app.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `Suggest next steps for this job application.

Company: ${app.companyName}
Role: ${app.roleTitle}
Current status: ${app.status}
Priority: ${app.priority}
${app.dateApplied ? `Date applied: ${app.dateApplied.toISOString().slice(0, 10)}` : "Not yet applied"}
Days since last update: ${daysSinceUpdate}

Notes:
${formatNotes(app.notes)}

Upcoming reminders:
${remindersBlock}

Next steps (numbered list):`;

    const result = await model.generateContentStream(prompt);
    return streamResponse(result.stream);
  },
  { notesTake: 10 },
);
