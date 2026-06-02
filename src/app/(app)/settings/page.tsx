import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings · Job Tracker" };

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="mx-auto max-w-2xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your account and preferences.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Connected providers</CardTitle>
          <CardDescription>
            Sign-in methods linked to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Manage providers in your sign-in account settings. We never see
            your password.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Job Application Tracker helps you keep every application,
            interview, and follow-up in one place.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">Built with Next.js</Badge>
            <Badge variant="muted">Prisma + Postgres</Badge>
            <Badge variant="muted">Gemini AI</Badge>
          </p>
        </CardContent>
      </Card>
    </div>
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
