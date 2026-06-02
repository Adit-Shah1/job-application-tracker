"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Copy, Check, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function FollowUpButton({
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sparkles size={14} /> Draft follow-up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <FollowUpModal
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

function FollowUpModal({
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
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<"professional" | "friendly">("professional");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
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

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-zinc-500" />
          Draft follow-up email
        </DialogTitle>
        <DialogDescription>
          For {companyName} — {roleTitle}
        </DialogDescription>
      </DialogHeader>

      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tone
        </label>
        <Select
          value={tone}
          onChange={(e) => setTone(e.target.value as "professional" | "friendly")}
          className="w-40"
          disabled={loading}
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCcw size={14} /> Regenerate
        </Button>
      </div>

      <div className="min-h-[260px] rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900/40 dark:bg-red-950/30">
            <p className="text-sm font-medium">Couldn&apos;t generate</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {text || (loading ? "Drafting your follow-up…" : "")}
            {loading && (
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-zinc-500" />
            )}
          </pre>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button onClick={copyToClipboard} disabled={!text || loading}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy email"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
