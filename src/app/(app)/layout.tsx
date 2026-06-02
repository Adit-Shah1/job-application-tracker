import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";
import { MobileNav } from "@/components/ui/mobile-nav";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/signin" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-30 border-b border-zinc-200 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02)] dark:border-zinc-800 dark:bg-zinc-950"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-6">
          <MobileNav
            userName={session.user.name ?? null}
            userEmail={session.user.email ?? null}
            userImage={session.user.image ?? null}
            signOutAction={handleSignOut}
          />
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-zinc-900 to-zinc-700 text-zinc-50 shadow-sm shadow-zinc-900/20 transition-transform duration-200 group-hover:scale-105 dark:from-zinc-50 dark:to-zinc-300 dark:text-zinc-900">
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
            <span className="hidden sm:inline">Job Tracker</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <NavLink href="/dashboard" icon={<LayoutDashboard size={15} />}>
              Dashboard
            </NavLink>
            <NavLink href="/applications" icon={<Briefcase size={15} />}>
              Applications
            </NavLink>
            <NavLink href="/settings" icon={<Settings size={15} />}>
              Settings
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User avatar"}
                  className="h-7 w-7 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {(session.user.name ?? session.user.email ?? "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <form action={handleSignOut} className="hidden sm:block">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        {children}
      </main>
    </div>
  );
}
