"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  REMINDER_TYPES,
  REMINDER_TYPE_LABELS,
} from "@/lib/constants";
import {
  completeReminder,
  createReminder,
  deleteReminder,
} from "@/lib/actions/reminders";
import type { ActionResult } from "@/lib/actions/applications";
import { friendlyDate, isOverdue, fromNow } from "@/lib/dates";
import { useToast } from "@/components/ui/toast";
import { Bell, Check, Plus, Trash2 } from "lucide-react";
import type { Reminder, ReminderType } from "@/generated/prisma/client";

export function RemindersList({
  applicationId,
  reminders,
}: {
  applicationId: string;
  reminders: (Reminder & { application?: unknown })[];
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createReminder.bind(null, applicationId),
    null
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast({ title: "Reminder set" });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    } else if (state && !state.ok) {
      toast({ title: "Couldn't set reminder", description: state.error, variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const incomplete = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  return (
    <div className="space-y-4">
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} /> Add reminder
        </Button>
      ) : (
        <form
          ref={formRef}
          action={action}
          className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                name="reminderDate"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select name="reminderType" defaultValue="FOLLOW_UP">
                {REMINDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {REMINDER_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Set reminder"}
            </Button>
          </div>
        </form>
      )}

      {reminders.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          No reminders set. Stay on top of follow-ups.
        </p>
      ) : (
        <ul className="space-y-2">
          {incomplete.map((r) => (
            <ReminderItem key={r.id} reminder={r} />
          ))}
          {completed.length > 0 && (
            <>
              <li className="pt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Completed
              </li>
              {completed.map((r) => (
                <ReminderItem key={r.id} reminder={r} />
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}

function ReminderItem({ reminder }: { reminder: Reminder }) {
  const { toast } = useToast();
  const overdue = !reminder.completed && isOverdue(reminder.reminderDate);

  async function handleComplete() {
    const res = await completeReminder(reminder.id);
    if (res.ok) {
      toast({ title: "Reminder completed" });
    } else {
      toast({ title: "Couldn't update reminder", description: res.error, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this reminder?")) return;
    const res = await deleteReminder(reminder.id);
    if (res.ok) {
      toast({ title: "Reminder deleted" });
    } else {
      toast({ title: "Couldn't delete reminder", description: res.error, variant: "destructive" });
    }
  }

  return (
    <li
      className={
        reminder.completed
          ? "group flex items-center justify-between gap-2 rounded-lg border border-zinc-200/60 bg-zinc-50/60 p-3 text-sm transition-all duration-150 dark:border-zinc-800/60 dark:bg-zinc-900/30"
          : overdue
            ? "group flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-3 text-sm transition-all duration-150 hover:shadow-sm dark:border-red-900/40 dark:from-red-950/30 dark:to-red-950/10"
            : "group flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 bg-white/80 p-3 text-sm transition-all duration-150 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-zinc-700"
      }
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <Bell
          size={14}
          className={
            reminder.completed
              ? "mt-0.5 shrink-0 text-zinc-400"
              : overdue
                ? "mt-0.5 shrink-0 text-red-600"
                : "mt-0.5 shrink-0 text-zinc-500"
          }
        />
        <div className="min-w-0 flex-1">
          <div
            className={
              reminder.completed
                ? "text-zinc-500 line-through"
                : overdue
                  ? "font-medium text-red-900 dark:text-red-300"
                  : "font-medium"
            }
          >
            {REMINDER_TYPE_LABELS[reminder.reminderType as ReminderType]} ·{" "}
            {friendlyDate(reminder.reminderDate)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {fromNow(reminder.reminderDate)}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {!reminder.completed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleComplete}
            aria-label="Mark complete"
          >
            <Check size={14} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete reminder"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </li>
  );
}
