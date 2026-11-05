import { NextResponse, type NextRequest } from "next/server";

import { sendWelcomeOnce } from "@/features/auth/welcome";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation/redirect";

/**
 * Exchanges the one-time PKCE code from email links and OAuth for a session cookie.
 * `next` is checked against an allowlist so this can't become an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await sendWelcomeOnce();
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Common causes: link expired, already used, or opened in a different browser than the one
  // that requested it. Email confirmation still succeeds in that last case, so suggest signing in.
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
