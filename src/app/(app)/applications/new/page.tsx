import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { ImportFromUrl } from "@/components/applications/ImportFromUrl";

export const metadata = { title: "New application · Job Tracker" };

type SearchParams = {
  url?: string;
  title?: string;
  company?: string;
  role?: string;
  source?: string;
  location?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
};

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Try to parse company and role from the page title if not provided directly.
  // Common patterns: "Role at Company | LinkedIn", "Company - Role - Location", etc.
  let inferredCompany = params.company ?? "";
  let inferredRole = params.role ?? "";

  if (params.title && (!inferredCompany || !inferredRole)) {
    const title = params.title
      .replace(/\s*[|\-–—].*(?:LinkedIn|Indeed|Glassdoor|Greenhouse|Lever|Workday|Jobs?).*$/i, "")
      .trim();

    // Try "Role at Company"
    const atMatch = title.match(/^(.+?)\s+at\s+(.+)$/i);
    if (atMatch) {
      if (!inferredRole) inferredRole = atMatch[1].trim();
      if (!inferredCompany) inferredCompany = atMatch[2].trim();
    } else {
      // Try "Company - Role" or "Role - Company" (require spaces around dash to
      // avoid splitting on hyphens within titles like "Full-Stack Developer")
      const dashMatch = title.match(/^(.+?)\s+[-–—]\s+(.+)$/);
      if (dashMatch) {
        const [, a, b] = dashMatch;
        if (!inferredCompany) inferredCompany = a.trim();
        if (!inferredRole) inferredRole = b.trim();
      }
    }
  }

  const initialValues = {
    jobUrl: params.url ?? "",
    companyName: inferredCompany,
    roleTitle: inferredRole,
    source: params.source ?? (params.url ? "Bookmarklet" : ""),
    location: params.location ?? "",
    salaryMin: params.salaryMin ?? "",
    salaryMax: params.salaryMax ?? "",
    ...(params.currency ? { currency: params.currency } : {}),
  };

  const hasPrefill = Object.values(initialValues).some((v) => v !== "");

  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New application</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {hasPrefill
            ? "Review the pre-filled details and save when ready."
            : "Paste a job ad link to auto-fill, or capture the details by hand."}
        </p>
      </div>
      <ImportFromUrl />
      {/* Key remounts the uncontrolled form so new defaultValues actually show. */}
      <ApplicationForm
        key={JSON.stringify(initialValues)}
        mode="create"
        initialValues={initialValues}
      />
    </div>
  );
}
