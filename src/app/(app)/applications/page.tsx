import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { listApplications } from "@/lib/actions/applications";
import { ApplicationsTable, ApplicationsEmptyState } from "@/components/applications/ApplicationsTable";
import { ApplicationsFilterBar } from "@/components/applications/ApplicationsFilterBar";
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
  const applications = await listApplications(params);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>
        <ButtonLink href="/applications/new">
          <Plus size={15} /> New application
        </ButtonLink>
      </div>

      <Suspense>
        <ApplicationsFilterBar />
      </Suspense>

      {applications.length === 0 ? (
        <ApplicationsEmptyState />
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </div>
  );
}
