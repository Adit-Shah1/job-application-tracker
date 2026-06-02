import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { listApplications } from "@/lib/actions/applications";
import { ApplicationsTable, ApplicationsEmptyState } from "@/components/applications/ApplicationsTable";
import { ApplicationsFilterBar } from "@/components/applications/ApplicationsFilterBar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const metadata = { title: "Applications · Job Tracker" };

type SearchParams = {
  status?: string;
  priority?: string;
  search?: string;
  sort?: "recent" | "oldest" | "company" | "status";
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <Suspense
            fallback={
              <div
                className="skeleton mt-1 h-3 w-24 rounded"
                aria-hidden="true"
              />
            }
          >
            <ApplicationsCount params={params} />
          </Suspense>
        </div>
        <ButtonLink href="/applications/new">
          <Plus size={15} /> New application
        </ButtonLink>
      </div>

      <Suspense>
        <ApplicationsFilterBar />
      </Suspense>

      <Suspense fallback={<ApplicationsTableFallback />}>
        <ApplicationsList params={params} />
      </Suspense>
    </div>
  );
}

async function ApplicationsCount({ params }: { params: SearchParams }) {
  const applications = await listApplications(params);
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      {applications.length}{" "}
      {applications.length === 1 ? "application" : "applications"}
    </p>
  );
}

async function ApplicationsList({ params }: { params: SearchParams }) {
  const applications = await listApplications(params);
  if (applications.length === 0) return <ApplicationsEmptyState />;
  return <ApplicationsTable applications={applications} />;
}

function ApplicationsTableFallback() {
  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}
