"use client";

import { Bot, Check, FileCode2, LoaderCircle, User } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useInView, usePrefersReducedMotion } from "./reveal";

const CODE = [
  "create table public.notes (",
  "  id uuid primary key default gen_random_uuid(),",
  "  owner_id uuid not null default auth.uid(),",
  "  body text not null",
  ");",
  "alter table public.notes enable row level security;",
  'create policy "Notes: owner can read" on public.notes',
  "  for select using (owner_id = (select auth.uid()));",
];
const CHECKS = ["pnpm db:test", "pnpm check", "pnpm test:e2e"];

// One entry per step: how long to stay on it (ms). Step indices drive what is shown.
const USER_MSG = 1;
const READING = 2;
const CODE_START = 3;
const CHECKS_START = CODE_START + CODE.length;
const DONE = CHECKS_START + CHECKS.length;
const DURATIONS = [
  500,
  1000,
  1300,
  ...CODE.map(() => 380),
  ...CHECKS.map(() => 850),
  4200, // hold the finished state, then loop
];

function highlight(line: string) {
  const m = line.match(/^(\s*)(create table|alter table|create policy|for select)(.*)$/);
  if (!m) return line;
  return (
    <>
      {m[1]}
      <span className="text-highlight">{m[2]}</span>
      {m[3]}
    </>
  );
}

/**
 * Hero animation: a coding agent follows the AGENTS.md recipe to add an RLS table, then the
 * checks pass. Purely illustrative (aria-hidden); the figure has a text description.
 */
export function AgentDemo() {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = React.useState(0);
  const shown = reduced ? DONE : step;

  React.useEffect(() => {
    if (reduced || !inView) return;
    const id = setTimeout(() => setStep((s) => (s >= DONE ? 0 : s + 1)), DURATIONS[step]);
    return () => clearTimeout(id);
  }, [step, inView, reduced]);

  const codeLines = Math.max(0, Math.min(CODE.length, shown - CODE_START + 1));
  const checksDone = Math.max(0, shown - CHECKS_START);

  return (
    <figure
      ref={ref}
      className="overflow-hidden rounded-2xl border bg-card text-left shadow-lg"
      aria-labelledby="agent-demo-caption"
    >
      <figcaption id="agent-demo-caption" className="sr-only">
        Illustration: a coding agent reads AGENTS.md, writes a migration that adds a notes table
        with row-level security, then runs the database, unit and browser tests, which all pass.
      </figcaption>
      <div aria-hidden className="flex items-center gap-2 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 truncate font-mono text-xs text-muted-foreground">
          my-app · agent session
        </span>
        <span
          className={cn(
            "ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-500",
            shown >= DONE ? "bg-success/15 text-success" : "bg-accent text-accent-foreground",
          )}
        >
          {shown >= DONE ? "Ready for review" : "Working…"}
        </span>
      </div>

      <div aria-hidden className="grid md:grid-cols-[2fr_3fr]">
        {/* Conversation */}
        <div className="flex min-h-56 flex-col gap-3 border-b p-4 md:min-h-80 md:border-r md:border-b-0">
          {shown >= USER_MSG && (
            <div className="flex animate-pop-in gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="size-3.5" />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                Add a notes page with row-level security. Follow AGENTS.md.
              </p>
            </div>
          )}
          {shown >= READING && (
            <div className="flex animate-pop-in gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-3.5" />
              </span>
              <div className="space-y-1.5 rounded-2xl rounded-tl-sm border px-3 py-2 text-sm">
                <p>
                  Following <span className="font-mono text-xs">Recipe 1</span> (RLS table) and{" "}
                  <span className="font-mono text-xs">Recipe 2</span> (CRUD page).
                </p>
                {shown < CODE_START && (
                  <span className="flex gap-1 py-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          )}
          {shown >= DONE && (
            <div className="flex animate-pop-in gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-3.5" />
              </span>
              <p className="rounded-2xl rounded-tl-sm border px-3 py-2 text-sm">
                Done: migration, pgTAP test, page and nav. All checks pass.
              </p>
            </div>
          )}
        </div>

        {/* Editor + checks */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
            <FileCode2 className="size-3.5" />
            <span className="truncate font-mono">supabase/migrations/…_notes.sql</span>
          </div>
          <pre className="min-h-52 flex-1 overflow-hidden bg-instrument p-4 font-mono text-[11.5px] leading-relaxed text-instrument-foreground sm:text-xs">
            {CODE.slice(0, codeLines).map((line, i) => (
              <span key={i} className="block truncate">
                {highlight(line)}
                {i === codeLines - 1 && shown < CHECKS_START && (
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-highlight align-middle" />
                )}
              </span>
            ))}
          </pre>
          <ul className="grid gap-1.5 border-t p-4 text-sm sm:grid-cols-3">
            {CHECKS.map((c, i) => {
              const done = i < checksDone;
              const running = !done && shown === CHECKS_START + i;
              return (
                <li key={c} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border transition-colors duration-300",
                      done && "border-success bg-success text-success-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="size-3 animate-pop-in" />
                    ) : running ? (
                      <LoaderCircle className="size-3 animate-spin text-muted-foreground" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {c}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </figure>
  );
}
