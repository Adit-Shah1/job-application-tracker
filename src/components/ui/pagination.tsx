"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function href(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
    if (currentPage > 4 && currentPage < totalPages - 3) {
      pages.splice(3, 1, "...", currentPage - 1, currentPage, currentPage + 1, "...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={href(currentPage - 1)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
          currentPage <= 1
            ? "pointer-events-none text-zinc-300 dark:text-zinc-700"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        )}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
      >
        <ChevronLeft size={14} />
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-8 w-8 items-center justify-center text-xs text-zinc-400"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className={cn(
              "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-1 text-sm transition-colors",
              p === currentPage
                ? "bg-zinc-900 font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={href(currentPage + 1)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
          currentPage >= totalPages
            ? "pointer-events-none text-zinc-300 dark:text-zinc-700"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        )}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
      >
        <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
