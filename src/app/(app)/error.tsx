"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="outline">
          Go to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
