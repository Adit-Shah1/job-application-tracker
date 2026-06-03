"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateResumeLink } from "@/lib/actions/resumes";
import { ResumeManager } from "@/components/applications/ResumeManager";
import { useToast } from "@/components/ui/toast";
import { FileText } from "lucide-react";

export function ResumeSection({
  applicationId,
  selectedResumeId: initialResumeId,
}: {
  applicationId: string;
  selectedResumeId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialResumeId);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSelect(id: string | null) {
    setSelectedId(id);
    startTransition(async () => {
      const res = await updateResumeLink(applicationId, id);
      if (res.ok) {
        toast({ title: id ? "Resume linked" : "Resume unlinked" });
      } else {
        toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          <FileText size={12} className="mr-1 inline" />
          Resume Version
        </span>
        {pending && <span className="text-[10px] text-zinc-400">Saving…</span>}
      </div>
      <ResumeManager selectedResumeId={selectedId} onSelect={handleSelect} />
    </div>
  );
}
