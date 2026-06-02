import { Suspense } from "react";
import { ApplicationDetailContent } from "@/components/applications/ApplicationDetailContent";

export const metadata = { title: "Application · Job Tracker" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense>
      <ApplicationDetailContent id={id} />
    </Suspense>
  );
}
