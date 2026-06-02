import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        We couldn&apos;t find that page.
      </p>
      <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
    </div>
  );
}
