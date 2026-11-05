import { ArrowRight, Check, Plus } from "lucide-react";
import Link from "next/link";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { coreFeatures } from "@/components/marketing/features-data";
import { AgentDemo } from "@/components/marketing/motion/agent-demo";
import { AnimatedTerminal } from "@/components/marketing/motion/animated-terminal";
import { Marquee } from "@/components/marketing/motion/marquee";
import { Reveal } from "@/components/marketing/motion/reveal";
import { ShowcaseTabs } from "@/components/marketing/motion/showcase-tabs";
import { StackOrbit } from "@/components/marketing/motion/stack-orbit";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

// Agents that read AGENTS.md (Claude Code reads CLAUDE.md, which imports it).
const agents = ["Claude Code", "Cursor", "Codex", "GitHub Copilot", "Windsurf", "Zed", "Cline"];

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
      {/* Hero: big headline, then the terminal typing the real CLI session */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] opacity-70"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 md:pt-24">
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <Link
              href="/features"
              className="group inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-xs transition-colors hover:text-foreground"
            >
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                New
              </span>
              Stripe billing and an admin area
              <ArrowRight
                aria-hidden
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h1 className="mt-7 max-w-4xl font-heading text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {siteConfig.tagline}
            </h1>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
              A Next.js and Supabase starter with a considered interface, consistent patterns and
              setup checks, so you and your AI tools can extend it without guesswork.
            </p>
          </div>
          <div
            className="mt-9 flex animate-fade-up flex-wrap justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg">
              <Link href="/features">
                See what&apos;s included <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Create a free account</Link>
            </Button>
          </div>
          <div
            className="mt-14 w-full max-w-4xl animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <AnimatedTerminal />
          </div>
        </div>
      </section>

      <section aria-labelledby="agents-heading" className="border-y bg-subtle py-10">
        <h2
          id="agents-heading"
          className="mb-6 text-center text-sm font-medium text-muted-foreground"
        >
          Ships with instructions your coding agent reads
        </h2>
        <Marquee items={agents} label="Coding agents that read AGENTS.md" />
      </section>

      <Section aria-labelledby="agent-heading">
        <Reveal>
          <SectionHeading
            id="agent-heading"
            eyebrow="Built for coding agents"
            title="Ask for a feature. Get the pattern, the tests and green checks."
            description="AGENTS.md gives your agent the rules and step-by-step recipes, so its changes look like the rest of the codebase."
            center
            className="mb-12"
          />
        </Reveal>
        <Reveal delay={120} className="mx-auto max-w-5xl">
          <AgentDemo />
        </Reveal>
      </Section>

      <Section aria-labelledby="features-heading" className="pt-0 md:pt-0">
        <Reveal>
          <SectionHeading
            id="features-heading"
            eyebrow="What's inside"
            title="The foundation most SaaS products rebuild"
            description="Each part follows one documented pattern, so changes stay predictable."
            center
            className="mb-12"
          />
        </Reveal>
        <FeatureGrid features={coreFeatures.slice(0, 6)} />
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/features">
              All features and their status <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>

      <Section aria-labelledby="how-heading" className="pt-0 md:pt-0">
        <Reveal>
          <SectionHeading
            id="how-heading"
            eyebrow="How it works"
            title="Scaffold, secure, ship"
            center
            className="mb-10"
          />
        </Reveal>
        <Reveal delay={100}>
          <ShowcaseTabs />
        </Reveal>
      </Section>

      <Section aria-labelledby="stack-heading" className="pt-0 md:pt-0">
        <Reveal>
          <StackOrbit />
        </Reveal>
      </Section>

      <Section aria-labelledby="editions-heading" className="pt-0 md:pt-0">
        <Reveal>
          <SectionHeading
            id="editions-heading"
            eyebrow="Editions"
            title="Free to build with. Paid only if you want more."
            center
            className="mb-12"
          />
        </Reveal>
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <Reveal className="space-y-5 rounded-3xl border bg-card p-8 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-heading text-3xl font-semibold tracking-tight">Community</h3>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                Free · MIT
              </span>
            </div>
            <p className="text-muted-foreground">
              Everything a basic SaaS needs, built to the same security and test bar.
            </p>
            <ul className="space-y-3">
              {community.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link href="/signup">Start free</Link>
            </Button>
          </Reveal>
          <Reveal
            delay={120}
            className="relative space-y-5 overflow-hidden rounded-3xl border border-primary/30 bg-accent/40 p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-heading text-3xl font-semibold tracking-tight">Pro</h3>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                In development
              </span>
            </div>
            <p className="text-muted-foreground">
              A commercial edition that adds depth on top of Community. Not on sale yet.
            </p>
            <ul className="space-y-3">
              {pro.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-card text-accent-foreground">
                    <Plus className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section aria-labelledby="cta-heading" className="pt-0 md:pt-0">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-instrument px-6 py-16 text-center text-instrument-foreground sm:px-12 md:py-24">
          <div
            aria-hidden
            className="bg-grid pointer-events-none absolute inset-0 opacity-[0.07] [--color-border:white]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 animate-float rounded-full bg-highlight/30 blur-3xl motion-reduce:animate-none"
          />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2
              id="cta-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
            >
              Start from code you can read.
            </h2>
            <p className="font-mono text-sm text-instrument-muted sm:text-base">
              <span className="text-highlight" aria-hidden>
                ${" "}
              </span>
              npx create-agentlaunch my-app
            </p>
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
        </Reveal>
      </Section>
    </>
  );
}
