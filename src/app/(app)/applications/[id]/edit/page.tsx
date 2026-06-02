import { notFound } from "next/navigation";
import { getApplicationDetail } from "@/lib/queries";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplicationDetail(id);
  if (!app) notFound();
  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit application
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {app.companyName} — {app.roleTitle}
        </p>
      </div>
      <ApplicationForm mode="edit" application={app} />
    </div>
  );
}
