import { z } from "zod";
import { createAiRoute, streamResponse, formatNotes } from "@/lib/ai-route";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export const { POST } = createAiRoute(
  bodySchema,
  "summarize",
  async ({ app, genai }) => {
    const model = genai.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction:
        "You are a concise assistant that summarizes job application notes into a brief overview. " +
        "Output 3-5 bullet points capturing the most important information: timeline, key events, " +
        "decisions made, and current standing. Be factual and don't invent details.",
    });

    const prompt = `Summarize the following notes for a job application.

Company: ${app.companyName}
Role: ${app.roleTitle}
Current status: ${app.status}
${app.dateApplied ? `Date applied: ${app.dateApplied.toISOString().slice(0, 10)}` : "Not yet applied"}

Notes:
${formatNotes(app.notes)}

Summary (bullet points):`;

    const result = await model.generateContentStream(prompt);
    return streamResponse(result.stream);
  },
  { notesTake: 10 },
);
