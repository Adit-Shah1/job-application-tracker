import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { listApplications, type ApplicationFilters } from "@/lib/actions/applications";
import { ApplicationsTable, ApplicationsEmptyState } from "@/components/applications/ApplicationsTable";
import { KanbanBoard } from "@/components/applications/KanbanBoard";
import { ApplicationsFilterBar } from "@/components/applications/ApplicationsFilterBar";
import { ExportCsvButton } from "@/components/applications/ExportCsvButton";
import { BulkApplicationsWrapper } from "@/components/applications/BulkApplicationsWrapper";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Applications · Job Tracker" };

type SearchParams = {
  status?: string;
  priority?: string;
  search?: string;
  sort?: "recent" | "oldest" | "company" | "status";
  page?: string;
  view?: string;
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
        <div className="flex gap-2">
          <ViewToggle currentView={params.view ?? "list"} />
          <ExportCsvButton />
          <ButtonLink href="/applications/new">
            <Plus size={15} /> New application
          </ButtonLink>
        </div>
      </div>

      <Suspense>
        <ApplicationsFilterBar />
      </Suspense>

      <Suspense fallback={<ApplicationsTableFallback />}>
        <ApplicationsList params={params} view={params.view ?? "list"} />
      </Suspense>
    </div>
  );
}

async function ApplicationsCount({ params }: { params: SearchParams }) {
  const result = await listApplications({
    status: params.status,
    priority: params.priority,
    search: params.search,
    sort: params.sort,
    pageSize: 1,
  });
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      {result.total}{" "}
      {result.total === 1 ? "application" : "applications"}
    </p>
  );
}

async function ApplicationsList({ params, view }: { params: SearchParams; view: string }) {
  if (view === "kanban") {
    const result = await listApplications({ status: params.status, priority: params.priority, search: params.search, pageSize: 200 });
    if (result.total === 0) return <ApplicationsEmptyState />;
    return <KanbanBoard applications={result.data} />;
  }

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: ApplicationFilters = {
    status: params.status,
    priority: params.priority,
    search: params.search,
    sort: params.sort,
    page,
  };
  const result = await listApplications(filters);
  if (result.total === 0) return <ApplicationsEmptyState />;
  return (
    <BulkApplicationsWrapper applicationIds={result.data.map((a) => a.id)}>
      <ApplicationsTable applications={result.data} />
      <Pagination currentPage={result.page} totalPages={result.totalPages} />
    </BulkApplicationsWrapper>
  );
}

function ViewToggle({ currentView }: { currentView: string }) {
  const isKanban = currentView === "kanban";
  return (
    <div className="inline-flex rounded-md border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <Link
        href="/applications"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-l-md transition-colors ${
          !isKanban
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        }`}
        title="List view"
      >
        <List size={14} />
      </Link>
      <Link
        href="/applications?view=kanban"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-r-md border-l border-zinc-200/80 transition-colors dark:border-zinc-800 ${
          isKanban
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        }`}
        title="Kanban view"
      >
        <LayoutGrid size={14} />
      </Link>
    </div>
  );
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
