import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-zinc-200/80 bg-white px-3 py-1 pr-8 text-base shadow-sm transition-all duration-150 focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 focus-visible:shadow-md focus-visible:shadow-zinc-900/[0.04] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:border-zinc-600 dark:focus-visible:ring-zinc-300/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
