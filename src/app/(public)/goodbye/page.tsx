import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Account deleted · Job Tracker" };

export default function GoodbyePage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fade-up">
        <CardContent className="space-y-3 p-8 text-center">
          <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-zinc-50 shadow-lg shadow-zinc-900/20 dark:from-zinc-50 dark:to-zinc-300 dark:text-zinc-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your account has been deleted
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            All of your data, including applications, notes, reminders, and
            email drafts, has been permanently removed. We&apos;re sorry to
            see you go.
          </p>
          <div className="pt-2">
            <Link
              href="/signin"
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
