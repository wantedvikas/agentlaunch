import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">MIT-licensed. Your code, your deployment.</p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          <Link href="/features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          {siteConfig.repoUrl && (
            <a href={siteConfig.repoUrl} className="hover:text-foreground">
              Source
            </a>
          )}
          {siteConfig.contactEmail ? (
            <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-foreground">
              Contact
            </a>
          ) : (
            // Placeholder until NEXT_PUBLIC_CONTACT_EMAIL is set; deliberately not a link.
            <span title="Set NEXT_PUBLIC_CONTACT_EMAIL in .env.local to enable this link">
              Contact (not configured)
            </span>
          )}
        </nav>
      </div>
    </footer>
  );
}
