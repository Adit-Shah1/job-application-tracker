import { createAiRoute, formatNotes } from "@/lib/ai-route";
import { getApplicationP2Fields } from "@/lib/actions/resumes";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  jobDescription: z.string().min(10).max(10000),
});

export const { POST } = createAiRoute(
  bodySchema,
  "fit-score",
  async ({ app, genai, data }) => {
    const p2Fields = await getApplicationP2Fields(data.applicationId);
    const coverLetter = p2Fields?.coverLetter ?? null;

    const model = genai.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction:
        "You are a career coach that analyzes how well a candidate's background matches a job description. " +
        "Respond ONLY with valid JSON (no markdown, no code fences). The JSON must have this exact shape:\n" +
        '{\n  "score": <number 0-100>,\n  "summary": "<1-2 sentence overall assessment>",\n  "strengths": ["<strength 1>", "<strength 2>", ...],\n  "gaps": ["<gap 1>", "<gap 2>", ...],\n  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]\n}\n' +
        "Be specific and actionable. Base the score on keyword overlap, experience match, and skill alignment.",
    });

    const notesBlock = formatNotes(app.notes);

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
${data.jobDescription}

Return the JSON analysis:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const responseData = JSON.parse(jsonStr);

    return new Response(JSON.stringify(responseData), {
      headers: { "content-type": "application/json" },
    });
  },
  {
    formatError: (message) =>
      `AI generation failed. Try regenerating — ${message}`,
  },
);
