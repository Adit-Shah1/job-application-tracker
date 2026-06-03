/**
 * Type extensions for P2 fields added via raw SQL migration.
 * The Prisma CLI can't regenerate on Node v26, so we augment
 * the generated Application type with the new columns here.
 */

import type { Application } from "@/generated/prisma/client";

/** Application with P2 fields (contacts, cover letter, resume) */
export type ApplicationExtended = Application & {
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  coverLetter: string | null;
  resumeVersionId: string | null;
};

/** ResumeVersion with associated application count */
export type ResumeVersionWithCount = {
  id: string;
  userId: string;
  name: string;
  fileUrl: string;
  createdAt: Date;
  _count?: { applications: number };
};
