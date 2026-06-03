import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { applicationId } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 10 },
      reminders: { orderBy: { reminderDate: "asc" }, where: { completed: false }, take: 5 },
    },
  });
  if (!app || app.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  const rate = checkAiRateLimit(session.user.id);
  if (!rate.ok) {
    return new Response(
      JSON.stringify({ error: `Rate limit reached. Try again in ${rate.retryInSec}s.` }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const genai = getGemini();
  if (!genai) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server." }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const model = genai.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction:
      "You are a concise career advisor assistant. Suggest 3-5 specific, actionable next steps " +
      "for a job application. Be practical and specific to the application's current status. " +
      "Number each step. Keep each to 1-2 sentences.",
  });

  const notesBlock = app.notes.length
    ? app.notes
        .map((n, i) => `Note ${i + 1} (${n.createdAt.toISOString().slice(0, 10)}): ${n.content}`)
        .join("\n")
    : "No notes recorded yet.";

  const remindersBlock = app.reminders.length
    ? app.reminders
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
${notesBlock}

Upcoming reminders:
${remindersBlock}

Next steps (numbered list):`;

  try {
    const result = await model.generateContentStream(prompt);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
    return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai/next-steps] Gemini error:", message);
    return new Response(
      JSON.stringify({ error: `AI generation failed: ${message}` }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
