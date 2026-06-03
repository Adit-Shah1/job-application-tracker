"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createResume,
  deleteResume,
  listResumes,
  type ActionResult,
} from "@/lib/actions/resumes";
import { useActionState } from "react";
import { FileText, Plus, Trash2, ExternalLink, X } from "lucide-react";

type Resume = {
  id: string;
  name: string;
  fileUrl: string;
  createdAt: Date;
};

export function ResumeManager({
  selectedResumeId,
  onSelect,
}: {
  selectedResumeId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, startLoading] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startLoading(async () => {
      const data = await listResumes();
      setResumes(data);
    });
  }, []);

  const [createState, createAction, createPending] = useActionState<
    ActionResult | null,
    FormData
  >(
    async (_prev, formData) => {
      const res = await createResume(null, formData);
      if (res.ok) {
        toast({ title: "Resume added" });
        setShowAdd(false);
        const data = await listResumes();
        setResumes(data);
        if (onSelect && res.id) onSelect(res.id);
      } else {
        toast({ title: "Couldn't add resume", description: res.error, variant: "destructive" });
      }
      return res;
    },
    null
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume? It will be unlinked from any applications.")) return;
    const res = await deleteResume(id);
    if (res.ok) {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResumeId === id && onSelect) onSelect(null);
      toast({ title: "Resume deleted" });
    } else {
      toast({ title: "Couldn't delete", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-3">
      {/* Resume list */}
      {loading ? (
        <div className="text-xs text-zinc-500">Loading resumes…</div>
      ) : resumes.length === 0 && !showAdd ? (
        <div className="rounded-md border border-dashed border-zinc-200 p-3 text-center text-xs text-zinc-500 dark:border-zinc-800">
          <FileText className="mx-auto mb-1.5 h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          No resumes yet
        </div>
      ) : (
        <ul className="space-y-1.5">
          {resumes.map((r) => {
            const isSelected = selectedResumeId === r.id;
            return (
              <li
                key={r.id}
                className={`group flex items-center gap-2 rounded-md border p-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
                onClick={() => onSelect?.(isSelected ? null : r.id)}
              >
                <FileText
                  size={14}
                  className={isSelected ? "text-blue-600" : "text-zinc-400"}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {r.name}
                  </div>
                  <div className="text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(r.id);
                  }}
                  className="rounded p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add form */}
      {showAdd ? (
        <form action={createAction} className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Add resume
            </span>
            <button type="button" onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          </div>
          <Input name="name" placeholder="Resume name (e.g. 'Frontend v2')" required />
          <Input name="fileUrl" type="url" placeholder="https://drive.google.com/..." required />
          <Button type="submit" size="sm" disabled={createPending} className="w-full">
            {createPending ? "Adding…" : "Add resume"}
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdd(true)}
          className="w-full gap-1.5"
        >
          <Plus size={14} /> Add resume
        </Button>
      )}
    </div>
  );
}
