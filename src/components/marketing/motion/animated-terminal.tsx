"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { useInView, usePrefersReducedMotion } from "./reveal";

// What `npx create-agentlaunch` prints (trimmed). Keep in sync with the CLI.
type Line =
  | { kind: "cmd"; text: string }
  | { kind: "prompt"; text: string; answer: string }
  | { kind: "out"; text: string; tone?: "ok" | "dim" };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "npx create-agentlaunch my-app" },
  { kind: "prompt", text: "App name? (My App)", answer: "" },
  { kind: "prompt", text: "Social sign-in providers?", answer: "github" },
  { kind: "prompt", text: "Include Stripe billing …? (Y/n)", answer: "y" },
  { kind: "prompt", text: "Include Basic admin …? (Y/n)", answer: "y" },
  { kind: "out", text: "" },
  { kind: "out", text: "Creating My App in ./my-app" },
  { kind: "out", text: "  modules:  email, analytics, blog, uploads,", tone: "dim" },
  { kind: "out", text: "            ai, payments, admin, docker", tone: "dim" },
  { kind: "out", text: "  sign-in:  email, github", tone: "dim" },
  { kind: "out", text: "" },
  { kind: "out", text: "✓ Done. Next steps: cd my-app", tone: "ok" },
];

const TYPE_MS = 45; // per character
const LINE_MS = 260; // pause before each new line
const HOLD_MS = 5000; // finished state, then loop

/** Total characters "typed" per line (prompts reveal at once, then their answer types). */
const typed = (l: Line) =>
  l.kind === "cmd" ? l.text.length : l.kind === "prompt" ? l.answer.length : 0;

/**
 * The hero terminal: types the real `npx create-agentlaunch` session, line by line, and loops
 * while on screen. Reduced motion shows the finished session. The full text is also laid out
 * invisibly underneath, so the box never changes size (no layout shift).
 */
export function AnimatedTerminal({ className }: { className?: string }) {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  // line = index of the line being written; chars = characters typed on it so far
  const [pos, setPos] = React.useState({ line: 0, chars: 0 });
  const finished = reduced || pos.line >= SCRIPT.length;

  React.useEffect(() => {
    if (reduced || !inView) return;
    const { line, chars } = pos;
    if (line >= SCRIPT.length) {
      const id = setTimeout(() => setPos({ line: 0, chars: 0 }), HOLD_MS);
      return () => clearTimeout(id);
    }
    const current = SCRIPT[line]!;
    const id =
      chars < typed(current)
        ? setTimeout(() => setPos({ line, chars: chars + 1 }), TYPE_MS + Math.random() * 40)
        : setTimeout(
            () => setPos({ line: line + 1, chars: 0 }),
            current.kind === "cmd" ? 600 : LINE_MS,
          );
    return () => clearTimeout(id);
  }, [pos, inView, reduced]);

  const render = (all: boolean) =>
    SCRIPT.map((l, i) => {
      if (!all && !finished && i > pos.line) return null;
      const n = all || finished || i < pos.line ? Infinity : pos.chars;
      const active = !all && !finished && i === pos.line;
      const caret = active && (
        <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-blink bg-highlight" />
      );
      if (l.kind === "cmd")
        return (
          <span key={i} className="block">
            <span className="text-highlight">$ </span>
            {l.text.slice(0, n)}
            {caret}
          </span>
        );
      if (l.kind === "prompt")
        return (
          <span key={i} className="block">
            <span className="text-highlight">? </span>
            <span className="text-instrument-muted">{l.text}</span> {l.answer.slice(0, n)}
            {caret}
          </span>
        );
      return (
        <span
          key={i}
          className={cn(
            "block whitespace-pre",
            l.tone === "dim" && "text-instrument-muted",
            l.tone === "ok" && "text-instrument-ok",
            !all && !finished && "animate-pop-in",
          )}
        >
          {l.text || " "}
          {caret}
        </span>
      );
    });

  return (
    <figure
      ref={ref}
      aria-label="Terminal session: npx create-agentlaunch my-app"
      className={cn(
        "overflow-hidden rounded-2xl bg-instrument text-left text-instrument-foreground shadow-lg ring-1 ring-black/5",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
        <span className="size-3 rounded-full bg-[oklch(0.68_0.19_25)]" aria-hidden />
        <span className="size-3 rounded-full bg-[oklch(0.82_0.15_85)]" aria-hidden />
        <span className="size-3 rounded-full bg-[oklch(0.75_0.16_150)]" aria-hidden />
        <span className="ml-3 font-mono text-sm text-instrument-muted">terminal</span>
      </div>
      <pre
        tabIndex={0}
        className="grid overflow-x-auto p-4 font-mono text-[12px] leading-relaxed sm:p-8 sm:text-base md:text-lg"
      >
        {/* Screen readers get the whole session once, not the half-typed animation. */}
        <span className="sr-only">
          {SCRIPT.map((l) => ("answer" in l ? `${l.text} ${l.answer}` : l.text)).join("\n")}
        </span>
        <code aria-hidden className="invisible col-start-1 row-start-1">
          {render(true)}
        </code>
        <code aria-hidden className="col-start-1 row-start-1">
          {render(false)}
        </code>
      </pre>
    </figure>
  );
}
