/**
 * Single place to rebrand the app. "AgentLaunch" is a working name.
 * NEXT_PUBLIC_SITE_URL is used for canonical URLs, sitemap and OG tags.
 */
export const siteConfig = {
  name: "AgentLaunch",
  tagline: "The SaaS starter coding agents can work with.",
  description:
    "An MIT-licensed Next.js and Supabase SaaS starter with a polished interface, tested security patterns and setup you can verify.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Set NEXT_PUBLIC_REPO_URL to show "View source" links; hidden when empty.
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL ?? "",
  // Contact link placeholder: set NEXT_PUBLIC_CONTACT_EMAIL in .env.local.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  marketingNav: [
    { title: "Features", href: "/features" },
    // @module:blog
    { title: "Blog", href: "/blog" },
    // @end:blog
    { title: "Docs", href: "/features#get-started" },
  ],
  dashboardNav: [
    { title: "Overview", href: "/dashboard", icon: "overview" },
    { title: "Projects", href: "/dashboard/projects", icon: "projects" },
    // @module:uploads
    { title: "Files", href: "/dashboard/files", icon: "files" },
    // @end:uploads
    // @module:ai
    { title: "AI assistant", href: "/dashboard/ai", icon: "ai" },
    // @end:ai
    { title: "Settings", href: "/dashboard/settings", icon: "settings" },
  ],
} as const;

export type DashboardNavItem = (typeof siteConfig.dashboardNav)[number];
