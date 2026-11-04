import type { Metadata } from "next";
import Link from "next/link";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-subtle p-4 md:flex">
        <div className="px-2 pt-1">
          <Logo href="/dashboard" />
        </div>
        <DashboardNav />
        <Link
          href="/"
          className="mt-auto rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to site
        </Link>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <DashboardMobileNav />
          <div className="md:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Avatar className="size-8" aria-label="Guest (not signed in)">
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
