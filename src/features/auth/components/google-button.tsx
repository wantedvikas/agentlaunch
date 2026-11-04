import { Button } from "@/components/ui/button";
import { isGoogleAuthEnabled } from "@/lib/supabase/env";

import { signInWithGoogle } from "../actions";

/** Renders only when NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true, so there's never a dead button. */
export function GoogleButton({ next }: { next?: string }) {
  if (!isGoogleAuthEnabled) return null;
  return (
    <>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next ?? ""} />
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
