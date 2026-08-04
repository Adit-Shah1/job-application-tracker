"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

type Extracted = {
  companyName: string | null;
  roleTitle: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
};

export function ImportFromUrl() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extract(body: { url: string } | { text: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/extract-job", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Extraction failed. Try again.");
        if (data?.canPasteText) setShowPaste(true);
        return;
      }

      const fields: Extracted = await res.json();

      // Reuse the search-param prefill the bookmarklet already goes through, so
      // the form stays uncontrolled. The page keys ApplicationForm on these, which
      // remounts it with the new defaultValues.
      const params = new URLSearchParams();
      // Carry the typed URL through even on the paste-text fallback — the ad still
      // lives at that link, the site just wouldn't let us fetch it.
      const typedUrl = url.trim();
      if (typedUrl) {
        params.set("url", typedUrl);
        params.set("source", "URL import");
      }
      if (fields.companyName) params.set("company", fields.companyName);
      if (fields.roleTitle) params.set("role", fields.roleTitle);
      if (fields.location) params.set("location", fields.location);
      if (fields.salaryMin) params.set("salaryMin", String(fields.salaryMin));
      if (fields.salaryMax) params.set("salaryMax", String(fields.salaryMax));
      if (fields.currency) params.set("currency", fields.currency);

      router.replace(`/applications/new?${params}`);
    } catch {
      setError("Extraction failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim() && !loading) {
                e.preventDefault();
                void extract({ url: url.trim() });
              }
            }}
            placeholder="Paste a job ad link to auto-fill…"
            disabled={loading}
            aria-label="Job ad URL"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => void extract({ url: url.trim() })}
            disabled={loading || !url.trim()}
            className="gap-1.5 sm:w-auto"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Reading…" : "Auto-fill"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {showPaste && (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the job description text here instead…"
              rows={6}
              disabled={loading}
              aria-label="Job description text"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void extract({ text: text.trim() })}
              disabled={loading || text.trim().length < 50}
              className="gap-1.5"
            >
              <Sparkles size={14} />
              Auto-fill from text
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
