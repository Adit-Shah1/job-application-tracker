"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  icon,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
        active
          ? "text-zinc-950 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      )}
    >
      {active && (
        <span
          className="absolute inset-0 -z-10 rounded-md bg-zinc-100/80 shadow-inner dark:bg-zinc-800/60"
          aria-hidden="true"
        />
      )}
      {icon}
      <span>{children}</span>
    </Link>
  );
}
