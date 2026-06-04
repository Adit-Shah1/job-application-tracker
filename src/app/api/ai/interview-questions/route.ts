import { createAiRoute, streamResponse } from "@/lib/ai-route";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  roundType: z.string().min(1),
  roundNumber: z.coerce.number().int().min(1).max(50),
});

export const { POST } = createAiRoute(
  bodySchema,
  "interview-questions",
  async ({ app, genai, data }) => {
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
Round: #${data.roundNumber} — ${data.roundType}
${app.salaryMin || app.salaryMax ? `Salary: ${app.currency ?? ""} ${app.salaryMin ?? "?"} – ${app.salaryMax ?? "?"}` : ""}

Candidate notes:
${notesBlock}

Questions:`;

    const result = await model.generateContentStream(prompt);
    return streamResponse(result.stream);
  },
);
