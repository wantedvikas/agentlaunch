import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Shown instead of auth forms when Supabase env vars are missing. */
export function SupabaseNotConfigured() {
  return (
    <Alert variant="warning">
      <CircleAlert aria-hidden />
      <AlertTitle>Supabase isn&apos;t configured</AlertTitle>
      <AlertDescription>
        Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>, then restart
        the dev server. See <code>docs/LOCAL_SUPABASE.md</code>.
      </AlertDescription>
    </Alert>
  );
}
