import { z } from "zod";

export const interviewRoundSchema = z.object({
  roundNumber: z.coerce.number().int().min(1).max(50),
  type: z.enum(["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "ONSITE", "FINAL", "OTHER"]),
  interviewerName: z.string().max(120).nullable().optional(),
  interviewerEmail: z.string().email().max(255).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  feedback: z.string().max(5000).nullable().optional(),
  debriefNotes: z.string().max(5000).nullable().optional(),
  outcome: z.enum(["PENDING", "PASSED", "FAILED", "NO_SHOW"]).nullable().optional(),
});

export type InterviewRoundType = "PHONE_SCREEN" | "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "ONSITE" | "FINAL" | "OTHER";
export type InterviewOutcome = "PENDING" | "PASSED" | "FAILED" | "NO_SHOW" | null;

export type InterviewRoundRow = {
  id: string;
  applicationId: string;
  roundNumber: number;
  type: string;
  interviewerName: string | null;
  interviewerEmail: string | null;
  scheduledAt: Date | null;
  notes: string | null;
  feedback: string | null;
  debriefNotes: string | null;
  outcome: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  SYSTEM_DESIGN: "System Design",
  ONSITE: "Onsite",
  FINAL: "Final",
  OTHER: "Other",
};

export const OUTCOME_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PASSED: "Passed",
  FAILED: "Failed",
  NO_SHOW: "No Show",
};

export const INTERVIEW_TYPES: InterviewRoundType[] = [
  "PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "ONSITE", "FINAL", "OTHER",
];

export const OUTCOMES: InterviewOutcome[] = ["PENDING", "PASSED", "FAILED", "NO_SHOW"];
