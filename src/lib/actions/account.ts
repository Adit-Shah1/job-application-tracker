"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

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

  const linkedCount = await prisma.account.count({
    where: { userId: user.id },
  });
  if (linkedCount <= 1) {
    return {
      ok: false,
      error:
        "You can't disconnect your only sign-in method. Connect another provider first.",
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
