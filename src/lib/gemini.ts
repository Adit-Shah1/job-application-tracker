import { GoogleGenerativeAI } from "@google/generative-ai";

let cached: GoogleGenerativeAI | null = null;

export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!cached) {
    cached = new GoogleGenerativeAI(key);
  }
  return cached;
}

const buckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

export function checkAiRateLimit(userId: string): {
  ok: boolean;
  retryInSec?: number;
} {
  const now = Date.now();
  const bucket = buckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT) {
    return { ok: false, retryInSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}
