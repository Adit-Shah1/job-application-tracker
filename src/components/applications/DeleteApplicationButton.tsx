"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteApplication } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import { Trash2 } from "lucide-react";

export function DeleteApplicationButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this application? This cannot be undone.")) return;
        startTransition(async () => {
          const res = await deleteApplication(id);
          if (res && !res.ok) {
            toast({
              title: "Couldn't delete",
              description: res.error,
              variant: "destructive",
            });
            router.push("/applications");
          }
        });
      }}
    >
      <Trash2 size={14} /> {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
