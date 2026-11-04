import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Shown while accounts are not connected. Removed when Supabase auth is wired up
 * (Community milestone C2), at which point the dashboard requires sign-in.
 */
export function PreviewNotice() {
  return (
    <Alert variant="info">
      <Info aria-hidden />
      <AlertTitle>Preview mode</AlertTitle>
      <AlertDescription>
        Accounts and data are not connected in this build, so nothing here is saved. Sign-in and
        per-user data arrive with Supabase authentication.
      </AlertDescription>
    </Alert>
  );
}
