import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Plus } from "lucide-react";

export const metadata = { title: "Dashboard · Job Tracker" };

export default function DashboardPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your job search at a glance.
          </p>
        </div>
        <ButtonLink href="/applications/new">
          <Plus size={15} /> New application
        </ButtonLink>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
