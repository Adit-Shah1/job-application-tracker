import {
  ApplicationStatus,
  Priority,
  ReminderType,
} from "@/generated/prisma/client";

export type { ApplicationStatus, Priority, ReminderType };

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export const STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  "default" | "secondary" | "success" | "warning" | "info" | "danger" | "muted"
> = {
  SAVED: "muted",
  APPLIED: "info",
  INTERVIEWING: "warning",
  OFFER: "success",
  REJECTED: "danger",
  ARCHIVED: "secondary",
};

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const REMINDER_TYPES: ReminderType[] = [
  "FOLLOW_UP",
  "INTERVIEW",
  "DEADLINE",
  "OTHER",
];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  FOLLOW_UP: "Follow up",
  INTERVIEW: "Interview",
  DEADLINE: "Deadline",
  OTHER: "Other",
};


