"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, RefreshCcw, BookOpen, ArrowRight } from "lucide-react";

type Tab = "summarize" | "next-steps";

export function AIInsightsButton({
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
        <Sparkles size={14} /> AI Insights
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <AIInsightsModal
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

function AIInsightsModal({
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
  const [tab, setTab] = useState<Tab>("summarize");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate(mode: Tab) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setLoading(true);

    const endpoint = mode === "summarize" ? "/api/ai/summarize" : "/api/ai/next-steps";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  // Generate on initial open and when tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate(tab);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const hasText = text.length > 0;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-zinc-500" />
          AI Insights
        </DialogTitle>
        <DialogDescription>
          {companyName} — {roleTitle}
        </DialogDescription>
      </DialogHeader>

      {/* Tab buttons */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setTab("summarize")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "summarize"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <BookOpen size={14} /> Notes Summary
        </button>
        <button
          type="button"
          onClick={() => setTab("next-steps")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "next-steps"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <ArrowRight size={14} /> Next Steps
        </button>
      </div>

      {/* Content area */}
      <div className="relative min-h-[240px] rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        {loading && !hasText ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 size={12} className="animate-spin" />
              <span>AI is analyzing…</span>
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-11/12" />
              <div className="skeleton h-3 w-10/12" />
              <div className="skeleton h-3 w-9/12" />
              <div className="skeleton h-3 w-8/12" />
              <div className="skeleton h-3 w-6/12" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900/40 dark:bg-red-950/30">
            <p className="text-sm font-medium">Couldn&apos;t generate</p>
            <p className="mt-1 text-xs">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generate(tab)}
              className="mt-2"
            >
              <RefreshCcw size={12} /> Try again
            </Button>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
            {text}
            {loading && (
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-zinc-500" />
            )}
          </pre>
        )}

        {loading && hasText && (
          <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300">
            <Loader2 size={10} className="animate-spin" />
            AI thinking
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => generate(tab)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCcw size={14} />
          )}
          Regenerate
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
