"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useInView, usePrefersReducedMotion } from "./reveal";

type Panel = {
  id: string;
  label: string;
  title: string;
  body: string;
  lines: { text: string; tone?: "ok" | "dim" | "key" }[];
};

const PANELS: Panel[] = [
  {
    id: "scaffold",
    label: "Scaffold",
    title: "Only the modules you want",
    body: "Skip a module and its pages, migrations, tests and dependencies are removed, not hidden behind a flag.",
    lines: [
      { text: "$ npx create-agentlaunch my-app --no-blog --no-ai", tone: "key" },
      { text: "  removing blog … 5 files, 3 dependencies", tone: "dim" },
      { text: "  removing ai … 5 files, 1 dependency", tone: "dim" },
      { text: "  installing with pnpm …", tone: "dim" },
      { text: "✓ Created my-app (email, analytics, uploads, payments, admin)", tone: "ok" },
    ],
  },
  {
    id: "secure",
    label: "Secure",
    title: "Row-level security, proven by tests",
    body: "Every table ships with owner-only policies and SQL tests that log in as two users and try to cross the line.",
    lines: [
      { text: "$ pnpm db:test", tone: "key" },
      { text: "ok 1 - owner can read own projects", tone: "ok" },
      { text: "ok 2 - user B cannot read A's projects", tone: "ok" },
      { text: "ok 3 - users cannot grant themselves a subscription", tone: "ok" },
      { text: "ok 4 - non-admins cannot list users", tone: "ok" },
      { text: "All tests successful. Files=5, Tests=67", tone: "dim" },
    ],
  },
  {
    id: "ship",
    label: "Ship",
    title: "Checks before you deploy",
    body: "Doctor explains anything missing without printing a secret, and one command runs lint, types, tests and the build.",
    lines: [
      { text: "$ pnpm run doctor", tone: "key" },
      { text: "✓ Supabase reachable        auth is healthy", tone: "ok" },
      { text: "✓ Migrations                applied, anon denied", tone: "ok" },
      { text: "✓ STRIPE_SECRET_KEY         test-mode key set", tone: "ok" },
      { text: "$ pnpm check", tone: "key" },
      { text: "✓ lint  ✓ typecheck  ✓ 91 tests  ✓ build", tone: "ok" },
    ],
  },
];

const INTERVAL = 6500;

/** Auto-advancing tabs (pauses on hover/focus, off-screen and for reduced motion). */
export function ShowcaseTabs() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = React.useState(PANELS[0]!.id);
  const [paused, setPaused] = React.useState(false);
  const auto = inView && !paused && !reduced;

  React.useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      const i = PANELS.findIndex((p) => p.id === value);
      setValue(PANELS[(i + 1) % PANELS.length]!.id);
    }, INTERVAL);
    return () => clearTimeout(id);
  }, [auto, value]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <TabsPrimitive.Root value={value} onValueChange={setValue}>
        <TabsPrimitive.List
          aria-label="What AgentLaunch handles"
          className="mx-auto flex w-fit flex-wrap justify-center gap-2 rounded-full border bg-card p-1.5 shadow-xs"
        >
          {PANELS.map((p) => (
            <TabsPrimitive.Trigger
              key={p.id}
              value={p.id}
              className="relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              {p.label}
              {auto && value === p.id && (
                <span
                  key={value}
                  aria-hidden
                  className="absolute inset-x-3 bottom-1 h-0.5 origin-left animate-grow-x rounded-full bg-primary/60"
                  style={{ animationDuration: `${INTERVAL}ms` }}
                />
              )}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {PANELS.map((p) => (
          <TabsPrimitive.Content
            key={p.id}
            value={p.id}
            className="mt-8 grid items-center gap-8 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-[2fr_3fr] md:p-10"
          >
            <div className="space-y-3">
              <h3 className="font-heading text-2xl font-semibold tracking-tight">{p.title}</h3>
              <p className="text-muted-foreground">{p.body}</p>
            </div>
            <pre
              tabIndex={0}
              className="overflow-x-auto rounded-2xl bg-instrument p-5 font-mono text-xs leading-relaxed text-instrument-foreground sm:text-sm"
            >
              {p.lines.map((l, i) => (
                <span
                  key={`${value}-${i}`}
                  className={cn(
                    "block animate-pop-in whitespace-pre",
                    l.tone === "ok" && "text-instrument-ok",
                    l.tone === "dim" && "text-instrument-muted",
                    l.tone === "key" && "text-highlight",
                  )}
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  {l.text}
                </span>
              ))}
            </pre>
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    </div>
  );
}
