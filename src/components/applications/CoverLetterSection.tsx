"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateCoverLetter } from "@/lib/actions/resumes";
import { useToast } from "@/components/ui/toast";
import { Pencil, X, Check, FileText, Sparkles, Loader2 } from "lucide-react";

export function CoverLetterSection({
  applicationId,
  initialContent,
  collapsed = false,
}: {
  applicationId: string;
  initialContent: string | null;
  collapsed?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent ?? "");
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();

  async function generateWithAI() {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setContent("");
    setEditing(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription }),
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
        setContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setShowJobDesc(false);
    } catch (err) {
      toast({
        title: "Couldn't generate",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleSubmit(formData: FormData) {
    const coverLetterContent = String(formData.get("coverLetter") ?? "");
    startTransition(async () => {
      const res = await updateCoverLetter(applicationId, coverLetterContent || null);
      if (res.ok) {
        setContent(coverLetterContent);
        setEditing(false);
        toast({ title: "Cover letter saved" });
      } else {
        toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
      }
    });
  }

  if (collapsed && !editing && !content) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
        <FileText size={13} /> Add cover letter
      </Button>
    );
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Cover Letter
          </span>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-6 px-1.5">
            <Pencil size={12} />
          </Button>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {content || "No cover letter yet."}
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cover Letter
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowJobDesc(!showJobDesc)} disabled={generating} className="h-6 gap-1 px-1.5">
            <Sparkles size={12} /> Generate with AI
          </Button>
          <button type="button" onClick={() => setEditing(false)} className="text-zinc-400 hover:text-zinc-600">
            <X size={14} />
          </button>
        </div>
      </div>
      {showJobDesc && (
        <div className="space-y-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-800 dark:bg-indigo-950/20">
          <label className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Paste the job description</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste the job description to generate a tailored cover letter…"
            className="resize-y text-sm"
            disabled={generating}
          />
          <Button type="button" size="sm" onClick={generateWithAI} disabled={generating || jobDescription.trim().length < 10}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? "Generating…" : "Generate cover letter"}
          </Button>
        </div>
      )}
      <Textarea
        name="coverLetter"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={12}
        placeholder="Paste or write your cover letter here…"
        className="resize-y"
        disabled={generating}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X size={14} /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check size={14} /> {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
