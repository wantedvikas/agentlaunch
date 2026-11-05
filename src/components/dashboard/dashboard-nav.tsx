"use client";

import {
  CreditCard,
  FileUp,
  FolderKanban,
  Gem,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Icons for every nav item the template can include (optional modules add files, ai, premium, billing).
const icons = {
  overview: LayoutDashboard,
  projects: FolderKanban,
  files: FileUp,
  ai: Sparkles,
  premium: Gem,
  billing: CreditCard,
  settings: Settings,
} as const;

export function isActivePath(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {siteConfig.dashboardNav.map((item) => {
        const Icon = icons[item.icon];
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
