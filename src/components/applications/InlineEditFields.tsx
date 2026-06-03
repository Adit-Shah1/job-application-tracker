"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateApplication } from "@/lib/actions/applications";
import { APPLICATION_STATUSES, PRIORITIES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { Check, X, Pencil } from "lucide-react";
import type { Application } from "@/generated/prisma/client";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select-status" | "select-priority";
  placeholder?: string;
};

const EDITABLE_FIELDS: FieldDef[] = [
  { key: "companyName", label: "Company", type: "text", placeholder: "Acme Inc." },
  { key: "roleTitle", label: "Role", type: "text", placeholder: "Senior Engineer" },
  { key: "location", label: "Location", type: "text", placeholder: "Remote / New York" },
  { key: "jobUrl", label: "Job URL", type: "text", placeholder: "https://..." },
  { key: "source", label: "Source", type: "text", placeholder: "LinkedIn, referral…" },
  { key: "priority", label: "Priority", type: "select-priority" },
  { key: "status", label: "Status", type: "select-status" },
  { key: "salaryMin", label: "Salary min", type: "number", placeholder: "120000" },
  { key: "salaryMax", label: "Salary max", type: "number", placeholder: "160000" },
  { key: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { key: "dateApplied", label: "Date applied", type: "date" },
];

export function InlineEditFields({ application }: { application: Application }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Close editing on Escape
  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editing]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateApplication(application.id, null, formData);
      if (res.ok) {
        toast({ title: "Application updated" });
        setEditing(false);
      } else {
        toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
      }
    });
  }

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditing(true)}
        className="gap-1.5"
      >
        <Pencil size={13} /> Edit details
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EDITABLE_FIELDS.map((field) => {
          const value = application[field.key as keyof Application];
          const defaultVal = value != null ? String(value) : "";

          if (field.type === "select-status") {
            return (
              <FieldWrapper key={field.key} label={field.label}>
                <Select name={field.key} defaultValue={defaultVal || "SAVED"}>
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </Select>
              </FieldWrapper>
            );
          }
          if (field.type === "select-priority") {
            return (
              <FieldWrapper key={field.key} label={field.label}>
                <Select name={field.key} defaultValue={defaultVal || "MEDIUM"}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </Select>
              </FieldWrapper>
            );
          }

          return (
            <FieldWrapper key={field.key} label={field.label}>
              <Input
                name={field.key}
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                defaultValue={field.type === "date" && value ? new Date(value as Date).toISOString().slice(0, 10) : defaultVal}
                placeholder={field.placeholder}
                inputMode={field.type === "number" ? "numeric" : undefined}
              />
            </FieldWrapper>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X size={14} /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check size={14} /> {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}
