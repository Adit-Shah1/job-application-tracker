import { z } from "zod";

const emptyToNull = z
  .preprocess((v) => (v === "" || v === undefined ? null : v), z.string().nullable());

const emptyDateToNull = z
  .preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : v),
    z.coerce.date().nullable()
  );

const emptyIntToNull = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : v),
  z.coerce.number().int().positive().nullable()
);

export const applicationCreateSchema = z.object({
  companyName: z.string().min(1, "Company is required").max(120),
  roleTitle: z.string().min(1, "Role is required").max(120),
  jobUrl: emptyToNull.refine(
    (v) => v === null || /^https?:\/\//.test(v),
    "Must be a valid URL"
  ),
  location: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().max(120).nullable().optional()
  ),
  status: z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "ARCHIVED",
  ]),
  salaryMin: emptyIntToNull,
  salaryMax: emptyIntToNull,
  currency: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().max(8).nullable().optional()
  ),
  dateApplied: emptyDateToNull,
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  source: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().max(80).nullable().optional()
  ),
});

export const applicationUpdateSchema = applicationCreateSchema.partial();

export const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(5000),
});

export const reminderSchema = z.object({
  reminderDate: z.coerce.date(),
  reminderType: z.enum(["FOLLOW_UP", "INTERVIEW", "DEADLINE", "OTHER"]),
  applicationId: z.string().min(1),
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
