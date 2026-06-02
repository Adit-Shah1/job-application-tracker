import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  tone: z.enum(["professional", "friendly"]).default("professional"),
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
  const { applicationId, tone } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!app || app.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  const rate = checkAiRateLimit(session.user.id);
  if (!rate.ok) {
    return new Response(
      JSON.stringify({
        error: `Rate limit reached. Try again in ${rate.retryInSec}s.`,
      }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const genai = getGemini();
  if (!genai) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY is not configured on the server.",
      }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const model = genai.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction:
      "You are a concise, thoughtful assistant that drafts follow-up emails for job applications. " +
      "Use a clear subject line on the first line prefixed with 'Subject: '. " +
      "Keep the email to 4-7 short sentences. Do not invent facts; if information is missing, keep the email general. " +
      "Never include placeholders like [Your Name] — use a neutral sign-off like 'Best regards' followed by nothing else, so the user can add their name.",
  });

  const notesBlock = app.notes.length
    ? app.notes
        .map(
          (n, i) =>
            `Note ${i + 1} (${n.createdAt.toISOString().slice(0, 10)}): ${n.content}`
        )
        .join("\n")
    : "No notes recorded yet.";

  const prompt = `Draft a follow-up email.

Company: ${app.companyName}
Role: ${app.roleTitle}
Current status: ${app.status}
${app.dateApplied ? `Date applied: ${app.dateApplied.toISOString().slice(0, 10)}` : "Not yet applied"}
${app.location ? `Location: ${app.location}` : ""}

Context from notes:
${notesBlock}

Tone: ${tone === "friendly" ? "warm, conversational, and human" : "professional, polite, and direct"}.

Email:`;

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
    console.error("Gemini error:", err);
    return new Response(
      JSON.stringify({ error: "AI generation failed. Please try again." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
