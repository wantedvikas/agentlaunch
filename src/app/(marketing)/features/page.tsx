import type { Metadata } from "next";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { coreFeatures } from "@/components/marketing/features-data";
import { Section, SectionHeading } from "@/components/marketing/section";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything in the AgentLaunch Community starter, and what is still in progress.",
  alternates: { canonical: "/features" },
};

const comparison: [string, string, string][] = [
  ["Design system, UI kit, dark mode", "Included", "Included + premium layouts"],
  ["Auth (email, Google, GitHub, Microsoft, Slack) and row-level security", "Included", "Included"],
  ["Dashboard, example CRUD, file uploads, blog", "Included", "Included"],
  [
    "Stripe subscriptions with verified webhooks",
    "Basic (one plan)",
    "Full: one-time, tiers, trials, refunds",
  ],
  ["Other payment providers (Lemon Squeezy, Polar, Paddle, Dodo)", "—", "Included"],
  ["Admin dashboard", "Basic", "Roles, user actions, analytics"],
  ["AI", "Server-side demo", "Credits and usage limits"],
  ["Teams, multiple languages, mobile app", "—", "Included"],
  ["Project scaffolder (npx create-agentlaunch)", "Included", "Included + Pro modules"],
  ["Licence", "MIT", "Commercial"],
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pb-10 md:pb-12">
        <SectionHeading
          eyebrow="Features"
          title="What you get, and what's still coming"
          description="Every item is marked honestly. “Ready” is in this build; “Planned” is on the Community roadmap and not shipped yet."
        />
      </Section>

      <Section className="pt-0 md:pt-0" aria-label="Feature list">
        <FeatureGrid features={coreFeatures} />
      </Section>

      <Section aria-labelledby="compare-heading">
        <SectionHeading
          id="compare-heading"
          title="Community and Pro"
          description="Pro is in development and not on sale. The table shows the intended split."
          className="mb-8"
        />
        <Table>
          <TableCaption>Planned edition comparison. Subject to change before release.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Community</TableHead>
              <TableHead>Pro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.map(([cap, free, pro]) => (
              <TableRow key={cap}>
                <TableCell className="font-medium">{cap}</TableCell>
                <TableCell>{free}</TableCell>
                <TableCell>{pro}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section aria-labelledby="get-started" className="pt-0 md:pt-0">
        <SectionHeading id="get-started" title="Get started locally" className="mb-6" />
        <pre
          tabIndex={0}
          className="overflow-x-auto rounded-md bg-instrument p-5 font-mono text-sm leading-relaxed text-instrument-foreground"
        >
          <code>{`npx create-agentlaunch my-app
cd my-app
cp .env.example .env.local
pnpm db:start          # local Supabase (Docker)
pnpm run doctor        # checks setup, never prints secrets
pnpm dev               # http://localhost:3000`}</code>
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          Full setup instructions are in the repository README.
        </p>
      </Section>
    </>
  );
}
