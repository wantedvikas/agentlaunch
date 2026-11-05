import { Button } from "@/components/ui/button";
import { enabledOAuthProviders, OAUTH_PROVIDERS } from "@/lib/supabase/env";

import { signInWithOAuth } from "../actions";

/** One button per provider in NEXT_PUBLIC_AUTH_PROVIDERS; renders nothing when the list is empty. */
export function OAuthButtons({ next }: { next?: string }) {
  if (enabledOAuthProviders.length === 0) return null;
  return (
    <>
      <div className="grid gap-2">
        {enabledOAuthProviders.map((provider) => (
          <form key={provider} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={provider} />
            <input type="hidden" name="next" value={next ?? ""} />
            <Button type="submit" variant="outline" className="w-full">
              Continue with {OAUTH_PROVIDERS[provider]}
            </Button>
          </form>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
