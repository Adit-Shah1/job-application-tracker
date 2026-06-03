"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useOptimistic,
  useTransition,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createNote, deleteNote, updateNote } from "@/lib/actions/notes";
import type { ActionResult } from "@/lib/actions/applications";
import { fromNow } from "@/lib/dates";
import { Trash2, Save, Pencil, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { Note } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type OptimisticNote = Note & { isOptimistic?: boolean };

export function NotesList({
  applicationId,
  notes,
}: {
  applicationId: string;
  notes: Note[];
}) {
  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    notes,
    (current: Note[], update: { action: "add"; note: Note } | { action: "remove"; id: string }) => {
      if (update.action === "add") {
        return [update.note, ...current];
      }
      return current.filter((n) => n.id !== update.id);
    }
  );

  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createNote.bind(null, applicationId),
    null
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast({ title: "Note added" });
    } else if (state && !state.ok) {
      toast({ title: "Couldn't add note", description: state.error, variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const sorted = optimisticNotes
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        action={(formData) => {
          const content = formData.get("content") as string;
          if (content?.trim()) {
            addOptimisticNote({
              action: "add",
              note: {
                id: `optimistic-${Date.now()}`,
                applicationId,
                content,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          action(formData);
        }}
        className="space-y-2"
      >
        <Textarea
          name="content"
          placeholder="Add a note about this application…"
          rows={3}
          required
        />
        {state && !state.ok && state.fieldErrors?.content && (
          <p className="text-xs text-red-600">{state.fieldErrors.content[0]}</p>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Add note"}
          </Button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          No notes yet. Track interview prep, recruiter calls, or anything else.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((n) => (
            <NoteItem
              key={n.id}
              note={n}
              isOptimistic={"isOptimistic" in n ? (n as OptimisticNote).isOptimistic : false}
              onDelete={(id) => {
                addOptimisticNote({ action: "remove", id });
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteItem({
  note,
  isOptimistic,
  onDelete,
}: {
  note: Note;
  isOptimistic?: boolean;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateNote.bind(null, note.id),
    null
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state?.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(false);
      toast({ title: "Note updated" });
    } else if (state && !state.ok) {
      toast({ title: "Couldn't update note", description: state.error, variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleDelete() {
    if (!confirm("Delete this note?")) return;
    onDelete(note.id);
    startDeleteTransition(async () => {
      const res = await deleteNote(note.id);
      if (!res.ok) {
        toast({ title: "Couldn't delete note", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "Note deleted" });
      }
    });
  }

  if (editing) {
    return (
      <li className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <form ref={formRef} action={action} className="space-y-2">
          <Textarea
            name="content"
            defaultValue={note.content}
            rows={4}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              <X size={14} /> Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              <Save size={14} /> Save
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group rounded-lg border p-3 transition-all duration-150",
        isOptimistic
          ? "border-indigo-200 bg-indigo-50/50 opacity-70 dark:border-indigo-900/40 dark:bg-indigo-950/20"
          : "border-zinc-200/80 bg-white/80 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-zinc-700"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="whitespace-pre-wrap text-sm">{note.content}</p>
        <div className="flex shrink-0 gap-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label="Edit note"
            disabled={deletePending}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label="Delete note"
            disabled={deletePending}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {fromNow(note.createdAt)}
        {note.updatedAt.getTime() !== note.createdAt.getTime() && " (edited)"}
      </p>
    </li>
  );
}
