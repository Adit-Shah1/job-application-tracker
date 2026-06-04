import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  jobDescription: z.string().min(10).max(10000),
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
  const { applicationId, jobDescription } = parsed.data;

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
      "You are a professional career writer that drafts tailored cover letters. " +
      "Write a concise, compelling cover letter (3-4 paragraphs, 200-350 words). " +
      "Address it generically (no 'Dear Hiring Manager' — start with the first paragraph). " +
      "Match the tone to the company and role. Be specific about why the candidate is a good fit. " +
      "Do not invent facts. If information is missing, write generally about the role type. " +
      "Do not include a signature block — end after the final paragraph.",
  });

  const notesBlock = app.notes.length
    ? app.notes.map((n, i) => `Note ${i + 1}: ${n.content}`).join("\n")
    : "No notes.";

  const prompt = `Write a tailored cover letter for this application.

CANDIDATE:
- Applying for: ${app.roleTitle} at ${app.companyName}
- Location: ${app.location ?? "Not specified"}
${app.source ? `- Source: ${app.source}` : ""}

Notes from the candidate:
${notesBlock}

JOB DESCRIPTION:
${jobDescription}

Cover letter:`;

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
    console.error("[/api/ai/cover-letter] Gemini error:", message);
    return new Response(
      JSON.stringify({ error: `AI generation failed: ${message}` }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
