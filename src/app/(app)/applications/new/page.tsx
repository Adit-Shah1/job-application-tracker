import { ApplicationForm } from "@/components/applications/ApplicationForm";

export const metadata = { title: "New application · Job Tracker" };

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New application</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Capture the details now. You can update everything later.
        </p>
      </div>
      <ApplicationForm mode="create" />
    </div>
  );
}
