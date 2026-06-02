import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white shadow-sm shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-md hover:shadow-zinc-900/15 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:shadow-none",
        destructive: "bg-red-600 text-white shadow-sm shadow-red-900/10 hover:bg-red-700 hover:shadow-md hover:shadow-red-900/20",
        outline:
          "border border-zinc-200/80 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:bg-zinc-900 dark:hover:border-zinc-700",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        ghost:
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
