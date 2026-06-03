"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateContactInfo } from "@/lib/actions/resumes";
import { useToast } from "@/components/ui/toast";
import { Pencil, X, Check, FileText } from "lucide-react";

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
  const { toast } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateContactInfo(applicationId, formData);
      if (res.ok) {
        setContent(String(formData.get("coverLetter") ?? ""));
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
        <button type="button" onClick={() => setEditing(false)} className="text-zinc-400 hover:text-zinc-600">
          <X size={14} />
        </button>
      </div>
      <Textarea
        name="coverLetter"
        defaultValue={content}
        rows={12}
        placeholder="Paste or write your cover letter here…"
        className="resize-y"
      />
      <input type="hidden" name="contactName" value="" />
      <input type="hidden" name="contactEmail" value="" />
      <input type="hidden" name="contactPhone" value="" />
      <input type="hidden" name="resumeVersionId" value="" />
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
