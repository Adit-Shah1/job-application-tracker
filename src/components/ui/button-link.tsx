import Link from "next/link";
import { buttonVariants } from "./button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type ButtonLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    className?: string;
    children: React.ReactNode;
  };

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}
