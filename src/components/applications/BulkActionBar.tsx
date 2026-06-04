"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { bulkUpdateStatus } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";
import { X, Loader2, RefreshCw } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClear: () => void;
  onDone: () => void;
}

export function BulkActionBar({ selectedCount, selectedIds, onClear, onDone }: BulkActionBarProps) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleBulkUpdate(formData: FormData) {
    const status = formData.get("bulkStatus") as string;
    if (!status) return;

    startTransition(async () => {
      const res = await bulkUpdateStatus(selectedIds, status);
      if (res.ok) {
        toast({ title: `${selectedCount} application${selectedCount > 1 ? "s" : ""} updated to ${STATUS_LABELS[status as ApplicationStatus]}` });
        onDone();
      } else {
        toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
      }
    });
  }

  if (selectedCount === 0) return null;

  return (
    <div className="animate-fade-up sticky bottom-4 z-20 mx-auto max-w-xl rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {selectedCount} selected
        </span>
        <form action={handleBulkUpdate} className="flex flex-1 items-center gap-2">
          <Select name="bulkStatus" className="flex-1">
            <option value="">Change status to…</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {pending ? "Updating…" : "Apply"}
          </Button>
        </form>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          aria-label="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
