import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        outline: "text-zinc-950 dark:text-zinc-50",
        success:
          "border-transparent bg-gradient-to-b from-emerald-100 to-emerald-50 text-emerald-900 shadow-sm shadow-emerald-900/5 dark:from-emerald-900/40 dark:to-emerald-900/20 dark:text-emerald-200",
        warning:
          "border-transparent bg-gradient-to-b from-amber-100 to-amber-50 text-amber-900 shadow-sm shadow-amber-900/5 dark:from-amber-900/40 dark:to-amber-900/20 dark:text-amber-200",
        info:
          "border-transparent bg-gradient-to-b from-sky-100 to-sky-50 text-sky-900 shadow-sm shadow-sky-900/5 dark:from-sky-900/40 dark:to-sky-900/20 dark:text-sky-200",
        danger:
          "border-transparent bg-gradient-to-b from-red-100 to-red-50 text-red-900 shadow-sm shadow-red-900/5 dark:from-red-900/40 dark:to-red-900/20 dark:text-red-200",
        muted:
          "border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
