import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import { getApplicationP2Fields } from "@/lib/actions/resumes";
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

  const p2Fields = await getApplicationP2Fields(applicationId);
  const coverLetter = p2Fields?.coverLetter ?? null;

  const model = genai.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction:
      "You are a career coach that analyzes how well a candidate's background matches a job description. " +
      "Respond ONLY with valid JSON (no markdown, no code fences). The JSON must have this exact shape:\n" +
      '{\n  "score": <number 0-100>,\n  "summary": "<1-2 sentence overall assessment>",\n  "strengths": ["<strength 1>", "<strength 2>", ...],\n  "gaps": ["<gap 1>", "<gap 2>", ...],\n  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]\n}\n' +
      "Be specific and actionable. Base the score on keyword overlap, experience match, and skill alignment.",
  });

  const notesBlock = app.notes.length
    ? app.notes.map((n, i) => `Note ${i + 1}: ${n.content}`).join("\n")
    : "No notes.";

  const prompt = `Analyze how well this candidate matches the job description.

CANDIDATE PROFILE:
- Role applied for: ${app.roleTitle}
- Company: ${app.companyName}
- Location: ${app.location ?? "Not specified"}
${app.salaryMin || app.salaryMax ? `- Salary range: ${app.currency ?? ""} ${app.salaryMin ?? "?"} – ${app.salaryMax ?? "?"}` : ""}
${coverLetter ? `\nCover letter:\n${coverLetter}` : ""}

Notes from the candidate:
${notesBlock}

JOB DESCRIPTION:
${jobDescription}

Return the JSON analysis:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Try to extract JSON from the response
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const data = JSON.parse(jsonStr);

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ai/fit-score] Gemini error:", message);
    return new Response(
      JSON.stringify({ error: `AI generation failed. Try regenerating — ${message}` }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
