"use client";

import { useTransition, useOptimistic, useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { updateApplicationStatus } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Undo2, ChevronDown } from "lucide-react";

const STATUS_DOT: Record<ApplicationStatus, string> = {
  SAVED: "bg-zinc-400",
  APPLIED: "bg-sky-500",
  INTERVIEWING: "bg-amber-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
  ARCHIVED: "bg-zinc-500",
};

export function StatusSelect({
  applicationId,
  status,
  className,
}: {
  applicationId: string;
  status: ApplicationStatus;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const { toast } = useToast();
  const lastValue = useRef(status);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undoTarget, setUndoTarget] = useState<ApplicationStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 160 });

  // Track open→visible→closing lifecycle
  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 150); // match animation duration
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Position the menu relative to the button
  const updateMenuPos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 160) });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        const menu = document.getElementById("status-menu-portal");
        if (menu && menu.contains(target)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Update menu position synchronously before paint to avoid flash at (0,0)
  useLayoutEffect(() => {
    if (!open && !closing) return;
    updateMenuPos();
    const onScroll = () => updateMenuPos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, closing, updateMenuPos]);

  const performChange = useCallback(
    (next: ApplicationStatus, previous: ApplicationStatus) => {
      setOptimisticStatus(next);
      startTransition(async () => {
        const res = await updateApplicationStatus(applicationId, next);
        if (!res.ok) {
          toast({
            title: "Couldn't update status",
            description: res.error,
            variant: "destructive",
          });
          setOptimisticStatus(previous);
        } else {
          router.refresh();
        }
      });
    },
    [applicationId, router, setOptimisticStatus, toast]
  );

  const handleSelect = useCallback(
    (next: ApplicationStatus) => {
      setOpen(false);
      if (next === optimisticStatus) return;

      // Clear any pending undo
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoTarget(null);

      const previous = optimisticStatus;
      lastValue.current = previous;

      performChange(next, previous);

      // Show undo for 5 seconds
      setUndoTarget(previous);
      undoTimerRef.current = setTimeout(() => setUndoTarget(null), 5000);
    },
    [optimisticStatus, performChange]
  );

  const handleUndo = useCallback(() => {
    if (!undoTarget) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const current = optimisticStatus;
    setUndoTarget(null);
    performChange(undoTarget, current);
  }, [undoTarget, optimisticStatus, performChange]);

  return (
    <div className={cn("relative inline-flex items-center gap-2", className)} ref={containerRef}>      <button
        ref={buttonRef}
        type="button"
        disabled={pending}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 min-w-[140px] items-center gap-2 rounded-md border border-zinc-200/80 bg-white px-3 pl-7 text-sm shadow-sm transition-all duration-150 hover:border-zinc-300 focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-300/20",
          pending && "opacity-70"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors duration-200",
            STATUS_DOT[optimisticStatus],
            pending && "animate-pulse-soft"
          )}
          aria-hidden="true"
        />
        <span className="flex-1 text-left">{STATUS_LABELS[optimisticStatus]}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-zinc-400 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {visible && createPortal(
        <div
          id="status-menu-portal"
          className={cn(
            "fixed z-[100] min-w-[160px] overflow-hidden rounded-lg border border-zinc-200/80 bg-white py-1 shadow-lg shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-zinc-900/40",
            closing ? "animate-scale-out" : "animate-scale-in"
          )}
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {APPLICATION_STATUSES.map((s) => {
            const isActive = s === optimisticStatus;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <span
                  className={cn("h-2 w-2 rounded-full", STATUS_DOT[s])}
                  aria-hidden="true"
                />
                <span className="flex-1">{STATUS_LABELS[s]}</span>
                {isActive && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">✓</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}

      {undoTarget && !pending && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          className="h-7 gap-1 text-xs animate-fade-in"
        >
          <Undo2 size={12} />
          Undo
        </Button>
      )}
    </div>
  );
}
