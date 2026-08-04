/**
 * Helpers for fetching a job ad page and reducing it to text Gemini can read.
 * No HTML parser dependency: an LLM reads messy text fine, so a regex strip is
 * enough. The only goal here is cutting tokens, not understanding the page.
 */

// Generous on purpose: salary is usually near the bottom of an ad, and a real
// posting runs ~20k chars. ~10k tokens on flash-lite costs approximately nothing.
const MAX_TEXT = 40_000;
const MAX_BYTES = 5_000_000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

/** Some job boards serve different markup to non-browser clients. */
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Hosts that must never be fetched: loopback, link-local (cloud metadata lives
 * at 169.254.169.254), and RFC1918 ranges.
 */
const PRIVATE_HOST =
  /^(localhost|.*\.(local|internal|localhost)|0\.0\.0\.0|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|\[::1?\]|\[f[cd][0-9a-f]{2}:.*\])$/i;

/**
 * Why we refuse to fetch this URL, or null if it's allowed. https-only is
 * defence in depth — the cloud metadata endpoints that matter are http-only.
 *
 * ponytail: host-string matching, not resolve-then-connect. A hostname whose DNS
 * points at a private IP still gets through. Closing that needs a custom agent
 * doing lookup + IP check before connect; do it if this ever becomes multi-tenant.
 */
export function blockReason(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "That doesn't look like a link.";
  }
  if (u.protocol !== "https:") return "Only https:// links can be fetched.";
  if (PRIVATE_HOST.test(u.hostname)) return "That link points to a private address.";
  return null;
}

/** Strip markup down to readable text. Keeps <head> — <title> is a good signal. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&(?:#0*39|apos|#x0*27);/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n[ \t]*(?:\n[ \t]*)+/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT);
}

export type FetchResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/**
 * Fetch a job ad and return its visible text. Redirects are followed by hand so
 * every hop gets the isBlockedUrl check — `redirect: "follow"` would let an open
 * redirect on a job board bounce us onto an internal address.
 */
export async function fetchJobText(rawUrl: string): Promise<FetchResult> {
  let url = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const blocked = blockReason(url);
    if (blocked) return { ok: false, error: blocked };

    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "user-agent": BROWSER_UA,
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en-US,en;q=0.9",
        },
      });
    } catch {
      return {
        ok: false,
        error: "Couldn't reach that page (timed out or refused connection).",
      };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return { ok: false, error: "That page redirected nowhere." };
      url = new URL(location, url).toString();
      continue;
    }

    if (res.status === 404 || res.status === 410) {
      return { ok: false, error: "That job ad no longer exists (404). Check the link." };
    }

    if (!res.ok) {
      // 401/403/429/451, and LinkedIn's nonstandard 999, all mean bot-blocked.
      return {
        ok: false,
        error: `That site blocked the fetch (${res.status}). LinkedIn and Indeed always do — paste the job description text instead.`,
      };
    }

    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) {
      return { ok: false, error: "That link isn't a web page." };
    }

    // ponytail: content-length only; a chunked response with no length is bounded
    // by the 10s timeout instead. Good enough — the text is sliced to 15k anyway.
    if (Number(res.headers.get("content-length")) > MAX_BYTES) {
      return { ok: false, error: "That page is too large to read." };
    }

    const text = htmlToText(await res.text());
    if (text.length < 50) {
      return {
        ok: false,
        error:
          "That page had no readable text — it probably renders with JavaScript. Paste the job description text instead.",
      };
    }
    return { ok: true, text };
  }

  return { ok: false, error: "That link redirected too many times." };
}
