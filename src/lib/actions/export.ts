"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export type CsvExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string };

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportApplicationsCsv(): Promise<CsvExportResult> {
  const user = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { lastUpdated: "desc" },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      _count: { select: { reminders: true, notes: true } },
    },
  });

  if (applications.length === 0) {
    return { ok: false, error: "No applications to export." };
  }

  const headers = [
    "Company",
    "Role",
    "Status",
    "Priority",
    "Location",
    "Job URL",
    "Salary Min",
    "Salary Max",
    "Currency",
    "Date Saved",
    "Date Applied",
    "Last Updated",
    "Source",
    "Notes Count",
    "Reminders Count",
    "Notes",
  ];

  const rows = applications.map((app) => {
    const notesText = app.notes.map((n) => `[${n.createdAt.toISOString().slice(0, 10)}] ${n.content}`).join(" | ");
    return [
      escapeCsv(app.companyName),
      escapeCsv(app.roleTitle),
      escapeCsv(app.status),
      escapeCsv(app.priority),
      escapeCsv(app.location),
      escapeCsv(app.jobUrl),
      app.salaryMin ?? "",
      app.salaryMax ?? "",
      escapeCsv(app.currency),
      app.dateSaved.toISOString().slice(0, 10),
      app.dateApplied ? app.dateApplied.toISOString().slice(0, 10) : "",
      app.lastUpdated.toISOString().slice(0, 10),
      escapeCsv(app.source),
      app._count.notes,
      app._count.reminders,
      escapeCsv(notesText),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return { ok: true, csv, filename: `job-applications-${date}.csv` };
}
