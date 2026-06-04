"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Target, Loader2, RefreshCcw, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type FitScoreResult = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
};

export function FitScoreButton({
  applicationId,
  companyName,
  roleTitle,
}: {
  applicationId: string;
  companyName: string;
  roleTitle: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Target size={14} /> Fit Score
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <FitScoreModal
            applicationId={applicationId}
            companyName={companyName}
            roleTitle={roleTitle}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}

function FitScoreModal({
  applicationId,
  companyName,
  roleTitle,
  onClose,
}: {
  applicationId: string;
  companyName: string;
  roleTitle: string;
  onClose: () => void;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<FitScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function analyze() {
    if (!jobDescription.trim()) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/fit-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as FitScoreResult;
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : result.score >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400"
    : "";

  const scoreBg = result
    ? result.score >= 70
      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
      : result.score >= 40
        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
        : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
    : "";

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Target size={18} className="text-zinc-500" />
          Resume ↔ Job Fit Score
        </DialogTitle>
        <DialogDescription>
          {companyName} — {roleTitle}
        </DialogDescription>
      </DialogHeader>

      {!result ? (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Paste the job description
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here…"
              className="resize-y"
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              Analyzing fit…
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900/40 dark:bg-red-950/30">
              <p className="text-sm font-medium">Couldn&apos;t analyze</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button onClick={analyze} disabled={loading || jobDescription.trim().length < 10}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
              {loading ? "Analyzing…" : "Analyze fit"}
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          {/* Score circle */}
          <div className={cn("flex flex-col items-center gap-2 rounded-xl border p-6", scoreBg)}>
            <div className={cn("text-5xl font-bold tabular-nums", scoreColor)}>
              {result.score}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">out of 100</div>
            <p className="mt-1 text-center text-sm text-zinc-700 dark:text-zinc-300">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Strengths */}
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Strengths
              </h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <AlertTriangle size={12} /> Gaps
              </h4>
              <ul className="space-y-1">
                {result.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300">
                    • {g}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                <Lightbulb size={12} /> Suggestions
              </h4>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
            >
              <RefreshCcw size={14} /> New analysis
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}
