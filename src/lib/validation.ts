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

export const emailDraftSchema = z.object({
  content: z.string().min(1, "Draft cannot be empty").max(10000),
  tone: z.enum(["professional", "friendly"]),
});

export const emailSchema = z.string().email("Invalid email address").max(255);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be under 128 characters");

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).optional(),
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const setPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type EmailDraftInput = z.infer<typeof emailDraftSchema>;
