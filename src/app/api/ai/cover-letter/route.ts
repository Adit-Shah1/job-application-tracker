import { createAiRoute, formatNotes, streamResponse } from "@/lib/ai-route";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  jobDescription: z.string().min(10).max(10000),
});

export const { POST } = createAiRoute(
  bodySchema,
  "cover-letter",
  async ({ app, genai, data }) => {
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

    const notesBlock = formatNotes(app.notes);

    const prompt = `Write a tailored cover letter for this application.

CANDIDATE:
- Applying for: ${app.roleTitle} at ${app.companyName}
- Location: ${app.location ?? "Not specified"}
${app.source ? `- Source: ${app.source}` : ""}

Notes from the candidate:
${notesBlock}

JOB DESCRIPTION:
${data.jobDescription}

Cover letter:`;

    const result = await model.generateContentStream(prompt);
    return streamResponse(result.stream);
  },
);
