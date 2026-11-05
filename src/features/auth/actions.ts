"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/permissions/auth";
import { rateLimit } from "@/lib/rate-limit";
import { enabledOAuthProviders, type OAuthProvider } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type ActionResult } from "@/lib/validation/action-result";
import { safeNextPath } from "@/lib/validation/redirect";

import { sendWelcomeOnce } from "./welcome";

import {
  newPasswordSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
  type NewPasswordInput,
  type ResetRequestInput,
  type SignInInput,
  type SignUpInput,
} from "./schema";

const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

async function clientKey(scope: string, email = "") {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `${scope}:${ip}:${email}`;
}

/** Builds absolute callback URLs from the configured site URL, never from request headers. */
function callbackUrl(next: string) {
  return new URL(`/auth/callback?next=${encodeURIComponent(next)}`, siteConfig.url).toString();
}

export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { email, password, next } = parsed.data;
  if (!rateLimit(await clientKey("signin", email), 10, 5 * 60_000).ok)
    return { ok: false, error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        ok: false,
        error: "Confirm your email first. Check your inbox for the link we sent.",
      };
    }
    // Same message for unknown email and wrong password, so accounts can't be enumerated.
    return { ok: false, error: "Incorrect email or password." };
  }
  // Covers users whose confirmation link was opened in another browser (callback couldn't sign them in).
  await sendWelcomeOnce();
  redirect(safeNextPath(next));
}

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { email, password, displayName } = parsed.data;
  if (!rateLimit(await clientKey("signup"), 5, 15 * 60_000).ok)
    return { ok: false, error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl("/dashboard"), data: { display_name: displayName } },
  });
  if (error) {
    if (error.code === "weak_password") return { ok: false, error: error.message };
    console.error("signUp failed", error.code);
    return { ok: false, error: "We couldn't create your account. Please try again." };
  }
  // With confirmations on, Supabase returns success for existing emails too (no enumeration).
  return { ok: true, message: email };
}

export async function requestPasswordReset(input: ResetRequestInput): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { email } = parsed.data;
  if (!rateLimit(await clientKey("reset", email), 3, 15 * 60_000).ok)
    return { ok: false, error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl("/reset-password/update"),
  });
  if (error) console.error("resetPasswordForEmail failed", error.code);
  // Always report success so the form can't be used to discover which emails have accounts.
  return { ok: true, message: email };
}

export async function updatePassword(input: NewPasswordInput): Promise<ActionResult> {
  await requireUser("/reset-password/update");
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password")
      return { ok: false, error: "Choose a password you haven't used here before." };
    if (error.code === "weak_password") return { ok: false, error: error.message };
    console.error("updateUser(password) failed", error.code);
    return {
      ok: false,
      error: "We couldn't update your password. Request a new reset link and try again.",
    };
  }
  redirect("/dashboard?notice=password-updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=signed-out");
}

export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  // Only providers switched on in NEXT_PUBLIC_AUTH_PROVIDERS; the form value is untrusted.
  if (!enabledOAuthProviders.includes(provider as OAuthProvider)) redirect("/login?error=oauth");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as OAuthProvider,
    // Microsoft (azure) only returns an email address when asked for this scope.
    options: { redirectTo: callbackUrl(next), scopes: provider === "azure" ? "email" : undefined },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
