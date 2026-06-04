"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteApplication } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteApplicationButton({ id }: { id: string }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteApplication(id);
      if (res && !res.ok) {
        toast({
          title: "Couldn't delete",
          description: res.error,
          variant: "destructive",
        });
        setOpen(false);
      }
      // On success, deleteApplication calls redirect() which navigates automatically
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
      >
        <Trash2 size={14} /> Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This will permanently remove
              all associated notes, reminders, and status history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={pending}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              {pending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Delete application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
