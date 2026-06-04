import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAiRateLimit, getGemini } from "@/lib/gemini";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import type { Prisma } from "@/generated/prisma/client";
import type { z } from "zod";

type AppWithNotes = Prisma.ApplicationGetPayload<{
  include: { notes: true };
}>;

export type AiHandlerContext<T> = {
  app: AppWithNotes;
  genai: GoogleGenerativeAI;
  data: T;
};

/**
 * Creates a Next.js POST handler for an AI route with shared boilerplate:
 * - Auth check
 * - JSON body parsing with zod schema
 * - Application lookup + ownership verification
 * - Rate limiting
 * - Gemini client init
 * - Error catching with logging
 */
export function createAiRoute<T extends z.ZodType>(
  schema: T,
  routeName: string,
  handler: (ctx: AiHandlerContext<z.infer<T>>) => Promise<Response>,
  options?: { formatError?: (message: string) => string },
) {
  return {
    async POST(req: NextRequest): Promise<Response> {
      const session = await auth();
      if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
      }

      const json = await req.json().catch(() => null);
      const parsed = schema.safeParse(json);
      if (!parsed.success) {
        return new Response("Invalid request", { status: 400 });
      }

      const { applicationId } = parsed.data as { applicationId: string };
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
          JSON.stringify({
            error: `Rate limit reached. Try again in ${rate.retryInSec}s.`,
          }),
          { status: 429, headers: { "content-type": "application/json" } },
        );
      }

      const genai = getGemini();
      if (!genai) {
        return new Response(
          JSON.stringify({
            error: "GEMINI_API_KEY is not configured on the server.",
          }),
          { status: 503, headers: { "content-type": "application/json" } },
        );
      }

      try {
        return await handler({
          app: app as AppWithNotes,
          genai,
          data: parsed.data as z.infer<T>,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[/api/ai/${routeName}] Gemini error:`, message);
        return new Response(
          JSON.stringify({
            error: options?.formatError
              ? options.formatError(message)
              : `AI generation failed: ${message}`,
          }),
          { status: 500, headers: { "content-type": "application/json" } },
        );
      }
    },
  };
}

/**
 * Wraps a streaming async iterable (e.g. from model.generateContentStream)
 * into a plain-text Response.
 */
export function streamResponse(
  stream: AsyncIterable<{ text(): string }>,
): Response {
  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/** Format application notes into a numbered list. */
export function formatNotes(notes: { content: string }[]): string {
  if (!notes.length) return "No notes recorded yet.";
  return notes.map((n, i) => `Note ${i + 1}: ${n.content}`).join("\n");
}
