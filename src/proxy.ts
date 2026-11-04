import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets and metadata files; run on pages, actions and route handlers.
  matcher: [
    "/((?!_next/static|_next/image|icon.svg|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
