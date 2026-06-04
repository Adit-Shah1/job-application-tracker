"use client";

import { useState, useTransition, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  listInterviewRounds,
  createInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  type ActionResult,
} from "@/lib/actions/interviews";
import {
  INTERVIEW_TYPE_LABELS,
  OUTCOME_LABELS,
  INTERVIEW_TYPES,
  OUTCOMES,
  type InterviewRoundRow,
} from "@/lib/interviews";
import { formatDate } from "@/lib/dates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  Users,
  Calendar,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InterviewQuestionsButton } from "@/components/ai/InterviewQuestionsButton";



const OUTCOME_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PASSED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function InterviewRounds({ applicationId }: { applicationId: string }) {
  const [rounds, setRounds] = useState<InterviewRoundRow[]>([]);
  const [loading, startLoading] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    startLoading(async () => {
      const data = await listInterviewRounds(applicationId);
      setRounds(data);
    });
  }, [applicationId]);

  const [createState, createAction, createPending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      const res = await createInterviewRound(applicationId, null, formData);
      if (res.ok) {
        toast({ title: "Interview round added" });
        setShowAdd(false);
        const data = await listInterviewRounds(applicationId);
        setRounds(data);
      } else {
        toast({ title: "Couldn't add", description: res.error, variant: "destructive" });
      }
      return res;
    },
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletePending(true);
    const res = await deleteInterviewRound(deleteTarget);
    setDeletePending(false);
    if (res.ok) {
      setRounds((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast({ title: "Interview round deleted" });
    } else {
      toast({ title: "Couldn't delete", description: res.error, variant: "destructive" });
    }
    setDeleteTarget(null);
  }

  if (loading) {
    return <div className="text-xs text-zinc-500">Loading interview rounds…</div>;
  }

  return (
    <>
    <div className="space-y-3">
      {rounds.length === 0 && !showAdd && (
        <div className="rounded-md border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
          <Users className="mx-auto mb-1.5 h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          No interview rounds yet
        </div>
      )}

      {rounds.map((round) => (
        <div
          key={round.id}
          className="rounded-lg border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">#{round.roundNumber}</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {INTERVIEW_TYPE_LABELS[round.type] ?? round.type}
                </span>
                {round.outcome && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      OUTCOME_COLORS[round.outcome] ?? "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {OUTCOME_LABELS[round.outcome] ?? round.outcome}
                  </span>
                )}
              </div>
              {round.interviewerName && (
                <div className="mt-1 text-xs text-zinc-500">
                  <Users size={11} className="mr-1 inline" />
                  {round.interviewerName}
                  {round.interviewerEmail && (
                    <a href={`mailto:${round.interviewerEmail}`} className="ml-1 text-blue-600 hover:underline">
                      ({round.interviewerEmail})
                    </a>
                  )}
                </div>
              )}
              {round.scheduledAt && (
                <div className="mt-1 text-xs text-zinc-500">
                  <Calendar size={11} className="mr-1 inline" />
                  {formatDate(new Date(round.scheduledAt))}
                </div>
              )}
              {round.notes && (
                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <MessageSquare size={11} className="mr-1 inline" />
                  {round.notes}
                </div>
              )}
              {round.feedback && (
                <div className="mt-1 text-xs italic text-zinc-500">Feedback: {round.feedback}</div>
              )}
              {round.debriefNotes && (
                <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <span className="font-medium">Debrief:</span> {round.debriefNotes}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <InterviewQuestionsButton
                applicationId={applicationId}
                roundType={round.type}
                roundNumber={round.roundNumber}
              />
              <button
                type="button"
                onClick={() => setEditingId(editingId === round.id ? null : round.id)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(round.id)}
                className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {editingId === round.id && (
            <EditRoundForm
              round={round}
              applicationId={applicationId}
              onCancel={() => setEditingId(null)}
              onSaved={async () => {
                setEditingId(null);
                const data = await listInterviewRounds(applicationId);
                setRounds(data);
              }}
            />
          )}
        </div>
      ))}

      {showAdd ? (
        <form action={createAction} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">New Interview Round</span>
            <button type="button" onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Round #</label>
              <Input name="roundNumber" type="number" defaultValue={rounds.length + 1} min={1} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Type</label>
              <Select name="type" defaultValue="TECHNICAL">
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>{INTERVIEW_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Interviewer Name</label>
              <Input name="interviewerName" placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Interviewer Email</label>
              <Input name="interviewerEmail" type="email" placeholder="jane@company.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Scheduled At</label>
              <Input name="scheduledAt" type="datetime-local" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Outcome</label>
              <Select name="outcome" defaultValue="PENDING">
                {OUTCOMES.map((o) => (
                  <option key={o ?? ""} value={o ?? ""}>{OUTCOME_LABELS[o ?? ""] ?? "Pending"}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Notes</label>
            <Textarea name="notes" rows={2} placeholder="Topics covered, questions asked…" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Feedback</label>
            <Textarea name="feedback" rows={2} placeholder="How did it go?" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Debrief Notes</label>
            <Textarea name="debriefNotes" rows={2} placeholder="What went well? What to improve? Red flags?" />
          </div>
          <Button type="submit" size="sm" disabled={createPending} className="w-full">
            {createPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {createPending ? "Adding…" : "Add round"}
          </Button>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(true)} className="w-full gap-1.5">
          <Plus size={14} /> Add interview round
        </Button>
      )}
    </div>

    <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete interview round</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this interview round? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deletePending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={confirmDelete}
            disabled={deletePending}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {deletePending ? (
              <><Loader2 size={14} className="animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 size={14} /> Delete round</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function EditRoundForm({
  round,
  applicationId,
  onCancel,
  onSaved,
}: {
  round: InterviewRoundRow;
  applicationId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateInterviewRound(round.id, null, formData);
      if (res.ok) {
        toast({ title: "Round updated" });
        onSaved();
      } else {
        toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-3 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Round #</label>
              <Input name="roundNumber" type="number" defaultValue={round.roundNumber} min={1} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Type</label>
              <Select name="type" defaultValue={round.type}>
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>{INTERVIEW_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Interviewer Name</label>
              <Input name="interviewerName" defaultValue={round.interviewerName ?? ""} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Interviewer Email</label>
              <Input name="interviewerEmail" type="email" defaultValue={round.interviewerEmail ?? ""} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Scheduled At</label>
              <Input name="scheduledAt" type="datetime-local" defaultValue={round.scheduledAt ? new Date(round.scheduledAt).toISOString().slice(0, 16) : ""} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Outcome</label>
              <Select name="outcome" defaultValue={round.outcome ?? "PENDING"}>
                {OUTCOMES.map((o) => (
                  <option key={o ?? "none"} value={o ?? ""}>{OUTCOME_LABELS[o ?? ""] ?? "Pending"}</option>
                ))}
              </Select>
            </div>
          </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Notes</label>
        <Textarea name="notes" rows={2} defaultValue={round.notes ?? ""} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Feedback</label>
        <Textarea name="feedback" rows={2} defaultValue={round.feedback ?? ""} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Debrief Notes</label>
        <Textarea name="debriefNotes" rows={2} defaultValue={round.debriefNotes ?? ""} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={14} /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check size={14} /> {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
