"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { exportApplicationsCsv } from "@/lib/actions/export";
import { useToast } from "@/components/ui/toast";
import { Download, Loader2 } from "lucide-react";

export function ExportCsvButton() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleExport() {
    startTransition(async () => {
      const res = await exportApplicationsCsv();
      if (!res.ok) {
        toast({ title: "Couldn't export", description: res.error, variant: "destructive" });
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export downloaded" });
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {pending ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
