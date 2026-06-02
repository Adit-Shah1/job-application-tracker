"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/applications", label: "Applications", icon: Briefcase, exact: false },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
];

export function MobileNav({
  userName,
  userEmail,
  userImage,
  signOutAction,
}: {
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  signOutAction: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 sm:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-slide-in-right absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-200/80 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-semibold tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-zinc-900 to-zinc-700 text-zinc-50 dark:from-zinc-50 dark:to-zinc-300 dark:text-zinc-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </span>
                <span>Job Tracker</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    )}
                  >
                    <Icon size={17} className="text-zinc-500" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-zinc-200/80 bg-zinc-50/80 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-2 flex items-center gap-2.5 rounded-md bg-white px-2.5 py-2 ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:ring-zinc-800">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-medium text-zinc-50 dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900">
                    {(userName ?? userEmail ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {userName ?? userEmail ?? "—"}
                  </p>
                  {userName && userEmail && (
                    <p className="truncate text-xs text-zinc-500">{userEmail}</p>
                  )}
                </div>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-md border border-zinc-200/80 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  <LogOut size={16} className="text-zinc-500" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
