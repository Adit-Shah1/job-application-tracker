"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateApplicationStatus } from "@/lib/actions/applications";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { ApplicationStatus, Priority } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/constants";
import {
  FileText,
  Bell,
  MapPin,
  GripVertical,
} from "lucide-react";

const STATUS_DOT: Record<ApplicationStatus, string> = {
  SAVED: "bg-zinc-400",
  APPLIED: "bg-sky-500",
  INTERVIEWING: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-zinc-500",
};

const COLUMN_COLORS: Record<ApplicationStatus, string> = {
  SAVED: "border-zinc-300 dark:border-zinc-700",
  APPLIED: "border-sky-300 dark:border-sky-700",
  INTERVIEWING: "border-amber-300 dark:border-amber-700",
  OFFER: "border-emerald-300 dark:border-emerald-700",
  REJECTED: "border-red-300 dark:border-red-700",
  ARCHIVED: "border-zinc-400 dark:border-zinc-600",
};

const HEADER_BG: Record<ApplicationStatus, string> = {
  SAVED: "bg-zinc-50 dark:bg-zinc-900",
  APPLIED: "bg-sky-50/50 dark:bg-sky-950/20",
  INTERVIEWING: "bg-amber-50/50 dark:bg-amber-950/20",
  OFFER: "bg-emerald-50/50 dark:bg-emerald-950/20",
  REJECTED: "bg-red-50/50 dark:bg-red-950/20",
  ARCHIVED: "bg-zinc-50 dark:bg-zinc-900",
};

type AppCard = {
  id: string;
  companyName: string;
  roleTitle: string;
  location: string | null;
  status: ApplicationStatus;
  priority: Priority;
  _count: { notes: number; reminders: number };
};

export function KanbanBoard({ applications }: { applications: AppCard[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ApplicationStatus | null>(null);

  // Group by status
  const columns: Record<ApplicationStatus, AppCard[]> = {
    SAVED: [], APPLIED: [], INTERVIEWING: [], OFFER: [], REJECTED: [], ARCHIVED: [],
  };
  for (const app of applications) {
    columns[app.status].push(app);
  }

  const handleDragStart = useCallback((e: React.DragEvent, appId: string) => {
    setDragId(appId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    setOverColumn(null);
    const appId = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    if (!appId) return;

    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === targetStatus) return;

    startTransition(async () => {
      const res = await updateApplicationStatus(appId, targetStatus);
      if (!res.ok) {
        toast({ title: "Couldn't update status", description: res.error, variant: "destructive" });
      } else {
        router.refresh();
      }
    });
  }, [dragId, applications, router, toast, startTransition]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setOverColumn(null);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STATUSES.map((status) => {
        const apps = columns[status];
        const isOver = overColumn === status;
        return (
          <div
            key={status}
            className={cn(
              "flex min-w-[260px] flex-1 flex-col rounded-xl border-t-2 bg-zinc-50/50 transition-colors dark:bg-zinc-900/50",
              COLUMN_COLORS[status],
              isOver && "bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-300/50 dark:ring-indigo-700/50"
            )}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={cn("flex items-center gap-2 rounded-t-xl px-3 py-2.5", HEADER_BG[status])}>
              <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[status])} />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                {STATUS_LABELS[status]}
              </h3>
              <span className="ml-auto rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {apps.length}
              </span>
            </div>

            <div className="flex-1 space-y-2 p-2">
              {apps.length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  Drag here
                </div>
              )}
              {apps.map((app) => (
                <KanbanCard
                  key={app.id}
                  app={app}
                  isDragging={dragId === app.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  app,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  app: AppCard;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const priorityVariant = app.priority === "HIGH" ? "danger" : app.priority === "MEDIUM" ? "warning" : "muted";

  const wasDragging = useRef(false);

  return (
    <a
      href={`/applications/${app.id}`}
      draggable
      onDragStart={(e) => {
        wasDragging.current = false;
        onDragStart(e, app.id);
      }}
      onDragEnd={() => {
        wasDragging.current = true;
        onDragEnd();
      }}
      onClick={(e) => {
        if (wasDragging.current) {
          e.preventDefault();
          wasDragging.current = false;
        }
      }}
      className={cn(
        "group block cursor-grab rounded-lg border border-zinc-200/80 bg-white p-3 text-sm shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="mt-0.5 shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {app.companyName}
          </div>
          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {app.roleTitle}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={priorityVariant} className="text-[10px]">
          {PRIORITY_LABELS[app.priority]}
        </Badge>
        {app.location && (
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
            <MapPin size={10} /> {app.location}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <FileText size={10} /> {app._count.notes}
        </span>
        <span className="inline-flex items-center gap-1">
          <Bell size={10} /> {app._count.reminders}
        </span>
      </div>
    </a>
  );
}
