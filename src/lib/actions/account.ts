"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  signUpSchema,
  signInSchema,
  setPasswordSchema,
  changePasswordSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

const VALID_PROVIDERS = ["github", "google"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

function isProvider(value: string): value is Provider {
  return (VALID_PROVIDERS as readonly string[]).includes(value);
}

export async function signInWithProvider(formData: FormData) {
  const provider = formData.get("provider");
  if (typeof provider !== "string" || !isProvider(provider)) {
    throw new Error("Invalid provider.");
  }
  await signIn(provider, { redirectTo: "/settings" });
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function signInWithEmail(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult | null> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Invalid email or password." };
        default:
          return { ok: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
  return null;
}

export async function signUpWithEmail(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult | null> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });

  if (existing) {
    if (existing.passwordHash) {
      return { ok: false, error: "An account with this email already exists. Sign in instead." };
    }
    return {
      ok: false,
      error:
        "This email is already linked to Google or GitHub. Sign in with that provider, then you can set a password in Settings.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Account created, but sign-in failed. Please try signing in." };
    }
    throw error;
  }
  return null;
}

export type PasswordResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function setPassword(
  _prev: PasswordResult | null,
  formData: FormData
): Promise<PasswordResult> {
  const user = await requireUser();
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (existing?.passwordHash) {
    return { ok: false, error: "You already have a password set. Use Change password instead." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  return { ok: true };
}

export async function changePassword(
  _prev: PasswordResult | null,
  formData: FormData
): Promise<PasswordResult> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!existing?.passwordHash) {
    return { ok: false, error: "You don't have a password set. Use Set password instead." };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, existing.passwordHash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  return { ok: true };
}

export async function removePassword(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: PasswordResult | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<PasswordResult> {
  const user = await requireUser();

  const linkedCount = await prisma.account.count({
    where: { userId: user.id },
  });

  if (linkedCount === 0) {
    return {
      ok: false,
      error:
        "You can't remove your password without a connected OAuth provider. Connect one first.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!existing?.passwordHash) {
    return { ok: false, error: "You don't have a password set." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: null },
  });

  revalidatePath("/settings");
  return { ok: true };
}

export type UnlinkResult =
  | { ok: true }
  | { ok: false; error: string };

export async function unlinkProvider(
  _prev: UnlinkResult | null,
  formData: FormData
): Promise<UnlinkResult> {
  const user = await requireUser();
  const provider = formData.get("provider");
  if (typeof provider !== "string" || !isProvider(provider)) {
    return { ok: false, error: "Invalid provider." };
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  const hasPassword = !!userRecord?.passwordHash;

  const linkedCount = await prisma.account.count({
    where: { userId: user.id },
  });

  if (linkedCount <= 1 && !hasPassword) {
    return {
      ok: false,
      error:
        "You can't disconnect your only sign-in method. Set a password or connect another provider first.",
    };
  }

  const result = await prisma.account.deleteMany({
    where: { userId: user.id, provider },
  });
  if (result.count === 0) {
    return { ok: false, error: "This provider isn't connected." };
  }

  return { ok: true };
}

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteAccount(
  _prev: DeleteAccountResult | null,
  formData: FormData
): Promise<DeleteAccountResult | null> {
  const user = await requireUser();
  const confirmation = (formData.get("confirmation") as string | null) ?? "";
  if (confirmation.trim().toLowerCase() !== user.email?.toLowerCase()) {
    return {
      ok: false,
      error: "Confirmation doesn't match your email.",
    };
  }

  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/goodbye" });
  return null;
}
