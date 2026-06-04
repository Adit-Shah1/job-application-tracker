import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  roundType: z.string().min(1),
  roundNumber: z.coerce.number().int().min(1).max(50),
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
  const { applicationId, roundType, roundNumber } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { notes: { orderBy: { createdAt: "desc" }, take: 5 } },
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
      "You are an experienced tech interviewer. Generate likely interview questions for a specific round. " +
      "Return 5-8 questions that are realistic and specific to the role, company, and round type. " +
      "For each question, include a brief tip on what the interviewer is looking for. " +
      "Format as a numbered list. Be concise and practical.",
  });

  const notesBlock = app.notes.length
    ? app.notes.map((n) => `- ${n.content.slice(0, 200)}`).join("\n")
    : "No notes.";

  const prompt = `Generate interview questions for this round.

Company: ${app.companyName}
Role: ${app.roleTitle}
Location: ${app.location ?? "Not specified"}
Round: #${roundNumber} — ${roundType}
${app.salaryMin || app.salaryMax ? `Salary: ${app.currency ?? ""} ${app.salaryMin ?? "?"} – ${app.salaryMax ?? "?"}` : ""}

Candidate notes:
${notesBlock}

Questions:`;

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

    return new Response(stream, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai/interview-questions] Gemini error:", message);
    return new Response(
      JSON.stringify({ error: `AI generation failed: ${message}` }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
