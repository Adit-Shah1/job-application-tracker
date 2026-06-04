import { notFound } from "next/navigation";
import { getApplicationDetail } from "@/lib/queries";
import { getApplicationP2Fields } from "@/lib/actions/resumes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusSelect } from "@/components/applications/StatusSelect";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { StatusTimeline } from "@/components/applications/StatusTimeline";
import { InlineEditFields } from "@/components/applications/InlineEditFields";
import { ContactSection } from "@/components/applications/ContactSection";
import { CoverLetterSection } from "@/components/applications/CoverLetterSection";
import { ResumeSection } from "@/components/applications/ResumeSection";
import { NotesList } from "@/components/notes/NotesList";
import { RemindersList } from "@/components/reminders/RemindersList";
import { DeleteApplicationButton } from "@/components/applications/DeleteApplicationButton";
import { FollowUpButton } from "@/components/ai/FollowUpButton";
import { AIInsightsButton } from "@/components/ai/AIInsightsButton";
import { FitScoreButton } from "@/components/ai/FitScoreButton";
import { EmailTemplateLibrary } from "@/components/ai/EmailTemplateLibrary";
import { InterviewRounds } from "@/components/applications/InterviewRounds";
import { Badge } from "@/components/ui/badge";
import { formatDate, daysBetween } from "@/lib/dates";
import { PRIORITY_LABELS } from "@/lib/constants";
import { ArrowLeft, ExternalLink, Pencil, MapPin, Briefcase, Calendar, DollarSign, Link2, Tag, Mail, Phone, User, Timer } from "lucide-react";

export async function ApplicationDetailContent({
  id,
}: {
  id: string;
}) {
  const [app, p2Fields] = await Promise.all([
    getApplicationDetail(id),
    getApplicationP2Fields(id),
  ]);
  if (!app) notFound();
  const contactName = p2Fields?.contactName ?? null;
  const contactEmail = p2Fields?.contactEmail ?? null;
  const contactPhone = p2Fields?.contactPhone ?? null;
  const coverLetter = p2Fields?.coverLetter ?? null;
  const resumeVersionId = p2Fields?.resumeVersionId ?? null;

  // Time-to-response: days from dateSaved to first non-SAVED status change
  const firstChange = app.statusChanges
    .filter((sc) => sc.toStatus !== "SAVED")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  const responseDays = firstChange ? daysBetween(app.dateSaved, firstChange.createdAt) : null;

  const salary =
    app.salaryMin || app.salaryMax
      ? app.salaryMin && app.salaryMax
        ? `${app.currency ?? ""} ${app.salaryMin.toLocaleString()} – ${app.salaryMax.toLocaleString()}`
        : `${app.currency ?? ""} ${(app.salaryMin ?? app.salaryMax)?.toLocaleString()}`
      : null;

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <ButtonLink href="/applications" variant="ghost" size="sm" className="-ml-2 mb-2">
          <ArrowLeft size={14} /> Back to applications
        </ButtonLink>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight break-words">
              {app.companyName}
            </h1>
            <p className="break-words text-zinc-600 dark:text-zinc-400">{app.roleTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusSelect applicationId={app.id} status={app.status} className="w-auto" />
              <StatusBadge status={app.status} />
              <Badge
                variant={
                  app.priority === "HIGH"
                    ? "danger"
                    : app.priority === "MEDIUM"
                      ? "warning"
                      : "muted"
                }
              >
                {PRIORITY_LABELS[app.priority]} priority
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:flex-shrink-0">
            <FitScoreButton
              applicationId={app.id}
              companyName={app.companyName}
              roleTitle={app.roleTitle}
            />
            <AIInsightsButton
              applicationId={app.id}
              companyName={app.companyName}
              roleTitle={app.roleTitle}
            />
            <ButtonLink href={`/applications/${app.id}/edit`} variant="outline" size="sm">
              <Pencil size={14} /> Edit
            </ButtonLink>
            <DeleteApplicationButton id={app.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Details</CardTitle>
              <InlineEditFields application={app} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow icon={<Briefcase size={14} />} label="Company" value={app.companyName} />
              <DetailRow icon={<MapPin size={14} />} label="Location" value={app.location ?? "—"} />
              {salary && (
                <DetailRow icon={<DollarSign size={14} />} label="Salary" value={salary} />
              )}
              <DetailRow
                icon={<Calendar size={14} />}
                label="Date saved"
                value={formatDate(app.dateSaved)}
              />
              <DetailRow
                icon={<Calendar size={14} />}
                label="Date applied"
                value={app.dateApplied ? formatDate(app.dateApplied) : "—"}
              />
              <DetailRow
                icon={<Calendar size={14} />}
                label="Last updated"
                value={formatDate(app.lastUpdated)}
              />
              {responseDays !== null && (
                <DetailRow
                  icon={<Timer size={14} />}
                  label="Response time"
                  value={`${responseDays} day${responseDays === 1 ? "" : "s"}`}
                />
              )}
              {app.source && (
                <DetailRow icon={<Tag size={14} />} label="Source" value={app.source} />
              )}
              {app.jobUrl && (
                <DetailRow
                  icon={<Link2 size={14} />}
                  label="Job posting"
                  value={
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  }
                />
              )}
              {(contactName || contactEmail || contactPhone) && (
                <>
                  <div className="border-t border-zinc-100 dark:border-zinc-800" />
                  {contactName && (
                    <DetailRow icon={<User size={14} />} label="Contact" value={contactName} />
                  )}
                  {contactEmail && (
                    <DetailRow
                      icon={<Mail size={14} />}
                      label="Email"
                      value={
                        <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                          {contactEmail}
                        </a>
                      }
                    />
                  )}
                  {contactPhone && (
                    <DetailRow
                      icon={<Phone size={14} />}
                      label="Phone"
                      value={
                        <a href={`tel:${contactPhone}`} className="text-blue-600 hover:underline">
                          {contactPhone}
                        </a>
                      }
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Contacts & Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContactSection applicationId={app.id} contactName={contactName} contactEmail={contactEmail} contactPhone={contactPhone} />
              <ResumeSection applicationId={app.id} selectedResumeId={resumeVersionId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Interview Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewRounds applicationId={app.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <RemindersList
                applicationId={app.id}
                reminders={app.reminders}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline changes={app.statusChanges} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <CoverLetterSection applicationId={app.id} initialContent={coverLetter} />
              </CardContent>
            </Card>
          )}
          {!coverLetter && <CoverLetterSection applicationId={app.id} initialContent={null} collapsed />}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Notes</CardTitle>
                <p className="mt-1 text-xs text-zinc-500">
                  Track interview prep, recruiter calls, and follow-ups.
                </p>
              </div>
              <FollowUpButton
                applicationId={app.id}
                companyName={app.companyName}
                roleTitle={app.roleTitle}
                savedDrafts={app.emailDrafts.map((d) => ({
                  id: d.id,
                  content: d.content,
                  tone: d.tone,
                  updatedAt: d.updatedAt,
                }))}
              />
              <EmailTemplateLibrary
                companyName={app.companyName}
                roleTitle={app.roleTitle}
                contactName={contactName ?? undefined}
              />
            </CardHeader>
            <CardContent>
              <NotesList applicationId={app.id} notes={app.notes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-zinc-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </div>
        <div className="text-zinc-950 dark:text-zinc-50">{value}</div>
      </div>
    </div>
  );
}
