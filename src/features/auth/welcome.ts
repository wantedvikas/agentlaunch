import "server-only";

import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";
import { createClient } from "@/lib/supabase/server";

/**
 * Sends the welcome email the first time a confirmed user signs in. The database claim makes it
 * at-most-once; if sending fails the user isn't blocked and no retry is attempted.
 * shortcut: no retry queue; add one (e.g. a jobs table + cron) if welcome delivery becomes critical.
 */
export async function sendWelcomeOnce() {
  const supabase = await createClient();
  const { data: claimed, error } = await supabase.rpc("claim_welcome_email");
  if (error || !claimed) return;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return;
  const name =
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  await sendEmail(welcomeEmail(user.email, name));
}
