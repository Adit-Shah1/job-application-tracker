"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCcw,
  Save,
  Pencil,
  X,
  Trash2,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteEmailDraft,
  saveEmailDraft,
} from "@/lib/actions/email-drafts";
import type { ActionResult } from "@/lib/actions/applications";

type Tone = "professional" | "friendly";

type SavedDraft = {
  id: string;
  content: string;
  tone: string;
  updatedAt: Date;
};

export function FollowUpButton({
  applicationId,
  companyName,
  roleTitle,
  savedDrafts = [],
}: {
  applicationId: string;
  companyName: string;
  roleTitle: string;
  savedDrafts?: SavedDraft[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sparkles size={14} /> Draft follow-up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <FollowUpModal
            applicationId={applicationId}
            companyName={companyName}
            roleTitle={roleTitle}
            initialDrafts={savedDrafts}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
}

function FollowUpModal({
  applicationId,
  companyName,
  roleTitle,
  initialDrafts,
  onClose,
}: {
  applicationId: string;
  companyName: string;
  roleTitle: string;
  initialDrafts: SavedDraft[];
  onClose: () => void;
}) {
  const [drafts, setDrafts] = useState<SavedDraft[]>(initialDrafts);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("professional");
  const [editing, setEditing] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const [saveState, saveAction, savePending] = useActionState<
    ActionResult | null,
    FormData
  >(
    async (_prev, formData) => saveEmailDraft(formData),
    null
  );

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setEditing(false);
    setActiveDraftId(null);
    setSaved("idle");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId, tone }),
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
  }, [tone]);

  useEffect(() => {
    if (!saveState) return;
    if (saveState.ok) {
      const newId = saveState.id ?? activeDraftId;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved("saved");
      if (newId) {
        setActiveDraftId(newId);
        setDrafts((prev) => {
          const idx = prev.findIndex((d) => d.id === newId);
          const entry: SavedDraft = {
            id: newId,
            content: text,
            tone,
            updatedAt: new Date(),
          };
          if (idx === -1) return [entry, ...prev];
          const next = prev.slice();
          next[idx] = entry;
          return next;
        });
      }
      toast({ title: activeDraftId ? "Draft updated" : "Draft saved" });
      setTimeout(() => setSaved("idle"), 1800);
    } else {
      toast({
        title: "Couldn't save draft",
        description: saveState.error,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveState]);

  function loadDraft(d: SavedDraft) {
    abortRef.current?.abort();
    setText(d.content);
    setError(null);
    setLoading(false);
    setEditing(true);
    setActiveDraftId(d.id);
    setTone((d.tone as Tone) ?? "professional");
    setSaved("idle");
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Clipboard access was blocked.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteDraft(d: SavedDraft, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this saved draft?")) return;
    const res = await deleteEmailDraft(d.id);
    if (res.ok) {
      setDrafts((prev) => prev.filter((x) => x.id !== d.id));
      if (activeDraftId === d.id) {
        setActiveDraftId(null);
        setEditing(false);
      }
      toast({ title: "Draft deleted" });
    } else {
      toast({
        title: "Couldn't delete draft",
        description: res.error,
        variant: "destructive",
      });
    }
  }

  const hasText = text.length > 0;
  const isBusy = loading || savePending;

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-zinc-500" />
          Draft follow-up email
        </DialogTitle>
        <DialogDescription>
          For {companyName} — {roleTitle}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="tone-select"
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Tone
            </label>
            <Select
              id="tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-40"
              disabled={isBusy}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generate}
              disabled={isBusy}
              className="ml-auto"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCcw size={14} />
              )}
              Regenerate
            </Button>
          </div>

          <div className="relative min-h-[280px] rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            {loading && !hasText ? (
              <StreamingPlaceholder />
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900/40 dark:bg-red-950/30">
                <p className="text-sm font-medium">Couldn&apos;t generate</p>
                <p className="mt-1 text-xs">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generate}
                  className="mt-2"
                >
                  <RefreshCcw size={12} /> Try again
                </Button>
              </div>
            ) : editing ? (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                className="min-h-[260px] resize-y border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
                disabled={loading}
              />
            ) : (
              <pre
                className={cn(
                  "whitespace-pre-wrap font-sans text-sm leading-relaxed",
                  !hasText && "text-zinc-400"
                )}
              >
                {text || "No draft yet."}
                {loading && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-zinc-500" />
                )}
              </pre>
            )}

            {loading && hasText && (
              <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300">
                <Loader2 size={10} className="animate-spin" />
                AI writing
              </div>
            )}

            {saved === "saved" && !loading && (
              <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/60 dark:bg-emerald-950/90 dark:text-emerald-300">
                <Check size={10} />
                Saved
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Saved drafts
            </h3>
            <span className="text-[10px] text-zinc-400">{drafts.length}</span>
          </div>
          {drafts.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <Mail className="mx-auto mb-1.5 h-5 w-5 text-zinc-300 dark:text-zinc-600" />
              No saved drafts yet. Click Save to keep one.
            </div>
          ) : (
            <ul className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
              {drafts.map((d) => {
                const isActive = activeDraftId === d.id;
                const preview = d.content.replace(/\s+/g, " ").slice(0, 80);
                const date = new Date(d.updatedAt);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => loadDraft(d)}
                      className={cn(
                        "group w-full rounded-md border p-2 text-left text-xs transition-all",
                        isActive
                          ? "border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                          : "border-zinc-200/80 bg-white/60 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="line-clamp-2 flex-1 leading-snug text-zinc-700 dark:text-zinc-300">
                          {preview || "(empty)"}
                        </span>
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => handleDeleteDraft(d, e)}
                          className="shrink-0 rounded p-0.5 text-zinc-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-950/30"
                          aria-label="Delete draft"
                        >
                          <Trash2 size={11} />
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="capitalize">{d.tone}</span>
                        <span>{date.toLocaleDateString()}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        {!editing && hasText && !loading && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} /> Edit
          </Button>
        )}
        {editing && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              if (!activeDraftId) setText("");
            }}
          >
            <X size={14} /> Done editing
          </Button>
        )}
        <form action={saveAction} className="contents">
          <input type="hidden" name="applicationId" value={applicationId} />
          {activeDraftId && (
            <input type="hidden" name="draftId" value={activeDraftId} />
          )}
          <input type="hidden" name="content" value={text} />
          <input type="hidden" name="tone" value={tone} />
          <Button type="submit" disabled={!hasText || loading || savePending}>
            {savePending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {activeDraftId ? "Update draft" : "Save draft"}
          </Button>
        </form>
        <Button onClick={copyToClipboard} disabled={!hasText || loading}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy email"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function StreamingPlaceholder() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 size={12} className="animate-spin" />
        <span>AI is drafting your follow-up…</span>
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-3 w-11/12" />
        <div className="skeleton h-3 w-10/12" />
        <div className="skeleton h-3 w-9/12" />
        <div className="skeleton h-3 w-8/12" />
        <div className="skeleton h-3 w-7/12" />
        <div className="skeleton h-3 w-6/12" />
        <div className="skeleton h-3 w-5/12" />
      </div>
    </div>
  );
}
