"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import {
  createApplication,
  updateApplication,
  type ActionResult,
} from "@/lib/actions/applications";
import type { Application, ApplicationStatus, Priority } from "@/generated/prisma/client";
import { useToast } from "@/components/ui/toast";

type Mode = "create" | "edit";

export function ApplicationForm({
  mode,
  application,
}: {
  mode: Mode;
  application?: Application;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const action = mode === "create" ? createApplication : null;
  const updateAction = mode === "edit" && application ? updateApplication.bind(null, application.id) : null;
  const serverAction = action ?? updateAction!;

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    serverAction,
    null
  );

  if (state?.ok) {
    if (mode === "create" && state.id) {
      toast({ title: "Application created" });
      router.push(`/applications/${state.id}`);
    } else if (mode === "edit") {
      toast({ title: "Application updated" });
      router.push(`/applications/${application!.id}`);
    }
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  const initial: {
    companyName: string;
    roleTitle: string;
    jobUrl: string;
    location: string;
    status: ApplicationStatus;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    dateApplied: string;
    priority: Priority;
    source: string;
  } = {
    companyName: application?.companyName ?? "",
    roleTitle: application?.roleTitle ?? "",
    jobUrl: application?.jobUrl ?? "",
    location: application?.location ?? "",
    status: application?.status ?? "SAVED",
    salaryMin: application?.salaryMin != null ? String(application.salaryMin) : "",
    salaryMax: application?.salaryMax != null ? String(application.salaryMax) : "",
    currency: application?.currency ?? "USD",
    dateApplied: application?.dateApplied
      ? new Date(application.dateApplied).toISOString().slice(0, 10)
      : "",
    priority: application?.priority ?? "MEDIUM",
    source: application?.source ?? "",
  };

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.ok && !Object.keys(fieldErrors).length && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company" error={fieldErrors.companyName?.[0]} required>
          <Input
            name="companyName"
            defaultValue={initial.companyName}
            placeholder="Acme Inc."
            required
          />
        </Field>
        <Field label="Role" error={fieldErrors.roleTitle?.[0]} required>
          <Input
            name="roleTitle"
            defaultValue={initial.roleTitle}
            placeholder="Senior Frontend Engineer"
            required
          />
        </Field>
        <Field label="Job URL" error={fieldErrors.jobUrl?.[0]}>
          <Input
            name="jobUrl"
            type="url"
            defaultValue={initial.jobUrl}
            placeholder="https://..."
          />
        </Field>
        <Field label="Location" error={fieldErrors.location?.[0]}>
          <Input
            name="location"
            defaultValue={initial.location}
            placeholder="Remote / New York, NY"
          />
        </Field>
        <Field label="Status" error={fieldErrors.status?.[0]}>
          <Select name="status" defaultValue={initial.status}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" error={fieldErrors.priority?.[0]}>
          <Select name="priority" defaultValue={initial.priority}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Salary min" error={fieldErrors.salaryMin?.[0]}>
          <Input
            name="salaryMin"
            type="number"
            inputMode="numeric"
            defaultValue={initial.salaryMin}
            placeholder="120000"
          />
        </Field>
        <Field label="Salary max" error={fieldErrors.salaryMax?.[0]}>
          <Input
            name="salaryMax"
            type="number"
            inputMode="numeric"
            defaultValue={initial.salaryMax}
            placeholder="160000"
          />
        </Field>
        <Field label="Currency" error={fieldErrors.currency?.[0]}>
          <Input
            name="currency"
            defaultValue={initial.currency}
            placeholder="USD"
            maxLength={8}
          />
        </Field>
        <Field label="Date applied" error={fieldErrors.dateApplied?.[0]}>
          <Input
            name="dateApplied"
            type="date"
            defaultValue={initial.dateApplied}
          />
        </Field>
        <Field label="Source" error={fieldErrors.source?.[0]}>
          <Input
            name="source"
            defaultValue={initial.source}
            placeholder="LinkedIn, referral, etc."
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2">
        <ButtonLink href="/applications" variant="outline">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create application"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
