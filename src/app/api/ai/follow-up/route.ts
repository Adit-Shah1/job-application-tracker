import { createAiRoute, streamResponse } from "@/lib/ai-route";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  tone: z.enum(["professional", "friendly"]).default("professional"),
});

export const { POST } = createAiRoute(
  bodySchema,
  "follow-up",
  async ({ app, genai, data }) => {
    const model = genai.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
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
              `Note ${i + 1} (${n.createdAt.toISOString().slice(0, 10)}): ${n.content}`,
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

Tone: ${data.tone === "friendly" ? "warm, conversational, and human" : "professional, polite, and direct"}.

Email:`;

    const result = await model.generateContentStream(prompt);
    return streamResponse(result.stream);
  },
);
