import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { coreFeatures } from "@/components/marketing/features-data";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

// What `npx create-agentlaunch` actually prints (trimmed). Keep in sync with the CLI.
const terminal: { prompt?: boolean; muted?: boolean; text: string }[] = [
  { prompt: true, text: "npx create-agentlaunch my-app" },
  { muted: true, text: "App name? (My App)" },
  { muted: true, text: "Social sign-in providers? github" },
  { muted: true, text: "Include Stripe billing …? (Y/n) y" },
  { muted: true, text: "Include Basic admin …? (Y/n) y" },
  { text: "" },
  { text: "Creating My App in ./my-app" },
  { text: "  modules:  email, analytics, blog, uploads," },
  { text: "            ai, payments, admin, docker" },
  { text: "  sign-in:  email, github" },
  { text: "" },
  { text: "Done. Next steps: cd my-app" },
];

const steps = [
  {
    title: "Scaffold",
    command: "npx create-agentlaunch my-app",
    body: "Choose sign-in providers and modules. Anything you skip is removed from the code, not hidden.",
  },
  {
    title: "Connect",
    command: "pnpm db:start && pnpm run doctor",
    body: "Local Supabase runs in Docker. Doctor checks your setup and never prints a secret.",
  },
  {
    title: "Build",
    command: "pnpm dev",
    body: "Follow the recipes in AGENTS.md, or let your coding agent follow them.",
  },
];

const community = [
  "Design system, UI kit, light and dark themes",
  "Auth, row-level security and SQL tests",
  "Dashboard, example CRUD and settings",
  // @module:payments
  "Stripe subscriptions with a verified webhook",
  // @end:payments
  // @module:admin
  "Admin area with users and stats",
  // @end:admin
  "Scaffolder, docs, tests and CI",
];

const pro = [
  "One-time payments, tiers, trials and refunds",
  "Lemon Squeezy, Polar, Paddle and Dodo",
  "Admin roles, user actions and an audit log",
  "AI credits, teams and multiple languages",
  "Premium layouts and a mobile app",
];

export default function HomePage() {
  return (
    <>
      <Section className="grid items-center gap-12 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-7">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Open source · MIT
          </p>
          <h1 className="font-heading text-5xl leading-[0.95] font-light text-balance sm:text-6xl lg:text-7xl">
            {siteConfig.tagline}
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            A Next.js and Supabase starter with a considered interface, consistent patterns and
            setup checks, so you and your AI tools can extend it without guesswork.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/features">
                See what&apos;s included <ArrowRight aria-hidden className="text-highlight" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Create a free account</Link>
            </Button>
          </div>
        </div>
        <figure className="overflow-hidden rounded-md bg-instrument text-instrument-foreground shadow-lg">
          <figcaption className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-xs text-instrument-muted">
            <span className="size-2 rounded-full bg-highlight" aria-hidden />
            terminal
          </figcaption>
          <pre tabIndex={0} className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
            <code>
              {terminal.map((line, i) => (
                <span key={i} className={`block ${line.muted ? "text-instrument-muted" : ""}`}>
                  {line.prompt && (
                    <span className="text-highlight" aria-hidden>
                      ${" "}
                    </span>
                  )}
                  {line.text || " "}
                </span>
              ))}
            </code>
          </pre>
        </figure>
      </Section>

      <Section aria-labelledby="features-heading" className="pt-0 md:pt-0">
        <SectionHeading
          id="features-heading"
          eyebrow="What's inside"
          title="The foundation most SaaS products rebuild"
          description="Each part follows one documented pattern, so changes stay predictable."
          className="mb-12"
        />
        <FeatureGrid features={coreFeatures.slice(0, 6)} />
        <div className="mt-10">
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
            title="Three commands to your own app"
            className="mb-12"
          />
          <ol className="grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.title} className="space-y-3 border-t border-foreground/20 pt-5">
                <h3 className="font-heading text-2xl font-normal">{s.title}</h3>
                <p className="overflow-x-auto rounded-sm border bg-card px-3 py-2 font-mono text-[13px] whitespace-nowrap">
                  <span className="text-muted-foreground" aria-hidden>
                    ${" "}
                  </span>
                  {s.command}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
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
          className="mb-12"
        />
        <div className="grid divide-y border-y md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="space-y-4 py-8 md:pr-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-heading text-3xl font-normal">Community</h3>
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                MIT · free
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Everything a basic SaaS needs, built to the same security and test bar.
            </p>
            <ul className="space-y-2.5 text-sm">
              {community.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 py-8 md:pl-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-heading text-3xl font-normal">Pro</h3>
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                In development
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A commercial edition that adds depth on top of Community. Not on sale yet.
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {pro.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden className="w-4 text-center">
                    +
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section aria-labelledby="cta-heading" className="bg-instrument text-instrument-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-2xl space-y-4">
            <h2
              id="cta-heading"
              className="font-heading text-4xl leading-none font-light text-balance sm:text-6xl"
            >
              Start from code you can read.
            </h2>
            <p className="font-mono text-sm text-instrument-muted">
              <span className="text-highlight" aria-hidden>
                ${" "}
              </span>
              npx create-agentlaunch my-app
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-highlight text-highlight-foreground hover:bg-highlight/90"
          >
            <Link href="/signup">
              Get started <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
