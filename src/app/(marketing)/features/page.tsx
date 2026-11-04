import type { Metadata } from "next";

import { coreFeatures } from "@/components/marketing/features-data";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
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
  ["Design system, UI kit, dark mode", "Included", "Included"],
  ["Supabase auth and row-level security", "Included", "Included"],
  ["Dashboard and example CRUD", "Included", "Included"],
  ["pnpm doctor setup checks", "Basic", "Advanced"],
  ["Stripe checkout, portal, webhooks", "—", "Included"],
  ["Email templates, blog, file uploads", "—", "Included"],
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map(({ icon: Icon, title, description, status }) => (
            <li key={title} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <Badge variant={status === "ready" ? "success" : "outline"}>
                  {status === "ready" ? "Ready" : "Planned"}
                </Badge>
              </div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
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
        <pre className="overflow-x-auto rounded-xl border bg-card p-5 font-mono text-sm leading-relaxed">
          <code>{`pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:3000
pnpm check        # lint, typecheck, tests, build`}</code>
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          Full setup instructions are in the repository README.
        </p>
      </Section>
    </>
  );
}
