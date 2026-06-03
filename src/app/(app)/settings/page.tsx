import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, enabledProviders } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { ConnectedProvidersCard } from "@/components/settings/ConnectedProvidersCard";
import { DeleteAccountCard } from "@/components/settings/DeleteAccountCard";

export const metadata = { title: "Settings · Job Tracker" };

const REPO_URL = "https://github.com/Adit-Shah1/job-application-tracker";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your account and preferences.
        </p>
      </div>

      <Suspense fallback={<CardSkeleton lines={2} />}>
        <ProfileCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton lines={2} />}>
        <ConnectedProvidersCardWrapper />
      </Suspense>

      <AboutCard />

      <Suspense fallback={<CardSkeleton lines={1} />}>
        <DeleteAccountCardWrapper />
      </Suspense>
    </div>
  );
}

async function ProfileCard() {
  const session = await auth();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Information from your sign-in provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Name" value={session?.user?.name ?? "—"} />
        <Row label="Email" value={session?.user?.email ?? "—"} />
      </CardContent>
    </Card>
  );
}

async function ConnectedProvidersCardWrapper() {
  const session = await auth();
  const userId = session?.user?.id;
  const accounts = userId
    ? await prisma.account.findMany({
        where: { userId },
        select: { provider: true },
      })
    : [];
  const linkedProviders = accounts
    .map((a) => a.provider)
    .filter((p): p is "github" | "google" => p === "github" || p === "google");

  return (
    <ConnectedProvidersCard
      linkedProviders={linkedProviders}
      enabledProviders={enabledProviders}
    />
  );
}

async function DeleteAccountCardWrapper() {
  const session = await auth();
  const email = session?.user?.email ?? "";
  if (!email) return null;
  return <DeleteAccountCard email={email} />;
}

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-48 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded" />
        ))}
      </CardContent>
    </Card>
  );
}

function AboutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          Job Application Tracker helps you keep every application,
          interview, and follow-up in one place.
        </p>
        <p className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">Built with Next.js</Badge>
          <Badge variant="muted">Prisma + Postgres</Badge>
          <Badge variant="muted">Gemini AI</Badge>
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-150 hover:border-zinc-300 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
          </svg>
          View source on GitHub
          <ExternalLink size={11} className="text-zinc-400" />
        </a>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
