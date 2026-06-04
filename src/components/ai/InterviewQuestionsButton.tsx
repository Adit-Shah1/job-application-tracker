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
import { Loader2, RefreshCcw, HelpCircle } from "lucide-react";
import { INTERVIEW_TYPE_LABELS } from "@/lib/interviews";

export function InterviewQuestionsButton({
  applicationId,
  roundType,
  roundNumber,
}: {
  applicationId: string;
  roundType: string;
  roundNumber: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded p-1 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
        title="Generate practice questions"
      >
        <HelpCircle size={12} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <QuestionsModal
            applicationId={applicationId}
            roundType={roundType}
            roundNumber={roundNumber}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}

function QuestionsModal({
  applicationId,
  roundType,
  roundNumber,
  onClose,
}: {
  applicationId: string;
  roundType: string;
  roundNumber: number;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId, roundType, roundNumber }),
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasText = text.length > 0;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <HelpCircle size={18} className="text-zinc-500" />
          Practice Questions
        </DialogTitle>
        <DialogDescription>
          Round #{roundNumber} — {INTERVIEW_TYPE_LABELS[roundType] ?? roundType}
        </DialogDescription>
      </DialogHeader>

      <div className="relative min-h-[240px] rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        {loading && !hasText ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 size={12} className="animate-spin" />
              <span>Generating questions…</span>
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
            <Button type="button" variant="outline" size="sm" onClick={generate} className="mt-2">
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
        <Button type="button" variant="outline" onClick={generate} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
          Regenerate
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
