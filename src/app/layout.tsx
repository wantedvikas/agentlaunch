import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";

// @module:analytics
import { Analytics } from "@/components/analytics/analytics";
// @end:analytics
import { themeInitScript } from "@/components/theme/theme";
import { Toaster } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";

import "./globals.css";

// Display headings: Barlow Condensed (light). Body: Barlow. Code: JetBrains Mono.
const headingFont = Barlow_Condensed({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});
const bodyFont = Barlow({
  variable: "--font-body-family",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});
const monoFont = JetBrains_Mono({ variable: "--font-mono-family", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline theme script sets class="dark" before React hydrates.
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
        {/* @module:analytics */}
        <Analytics />
        {/* @end:analytics */}
      </body>
    </html>
  );
}
