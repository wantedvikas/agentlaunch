import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { coreFeatures } from "@/components/marketing/features-data";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const tree = `src/
  app/
    (marketing)/   home, features
    (dashboard)/   overview, projects, settings
  components/
    ui/            22 accessible primitives
    marketing/     sections and blocks
    dashboard/     sidebar, page headers
  features/        one folder per feature
  config/site.ts   rename the app here
AGENTS.md          rules for coding agents`;

const steps = [
  { title: "Clone the template", body: "Start from the public repository and install with pnpm." },
  {
    title: "Connect your services",
    body: "Add your own Supabase keys. Nothing routes through us.",
  },
  {
    title: "Build your product",
    body: "Follow the recipes, or let your coding agent follow them.",
  },
];

export default function HomePage() {
  return (
    <>
      <Section className="grid items-center gap-12 pt-14 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <Badge variant="accent">Open source · MIT</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            A Next.js and Supabase starter with a considered interface, consistent patterns and
            setup checks, so you and your AI tools can extend it without guesswork.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/features">
                See what&apos;s included <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Preview the dashboard</Link>
            </Button>
          </div>
        </div>
        <figure className="overflow-hidden rounded-xl border bg-card shadow-md">
          <figcaption className="flex items-center gap-2 border-b bg-subtle px-4 py-2.5 text-xs text-muted-foreground">
            <span className="font-mono">agentlaunch-community</span>
            <span aria-hidden>·</span>
            project structure
          </figcaption>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-muted-foreground">
            <code>{tree}</code>
          </pre>
        </figure>
      </Section>

      <Section aria-labelledby="features-heading" className="pt-0 md:pt-0">
        <SectionHeading
          id="features-heading"
          eyebrow="What's inside"
          title="The foundation most SaaS products rebuild"
          description="Each part follows one documented pattern, so changes stay predictable."
          className="mb-10"
        />
        <FeatureGrid features={coreFeatures.slice(0, 6)} />
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link href="/features">
              All features and their status <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>

      <div className="border-y bg-subtle">
        <Section aria-labelledby="how-heading">
          <SectionHeading
            id="how-heading"
            eyebrow="How it works"
            title="Three steps to your own app"
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-sm">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section aria-labelledby="editions-heading">
        <SectionHeading
          id="editions-heading"
          eyebrow="Editions"
          title="Free to build with. Paid only if you want more."
          className="mb-10"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>Free forever, MIT licence.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  "Design system and UI kit",
                  "Auth and row-level security",
                  "Dashboard and example CRUD",
                  "Docs, tests and CI",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-success" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Pro</CardTitle>
                <Badge variant="outline">In development</Badge>
              </div>
              <CardDescription>
                A commercial edition that builds on Community. Not on sale yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Stripe subscriptions and one-time payments",
                  "Transactional email and MDX blog",
                  "Secure file uploads",
                  "Premium page layouts",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden>–</span> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
