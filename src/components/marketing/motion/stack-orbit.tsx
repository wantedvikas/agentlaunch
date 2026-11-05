import {
  Braces,
  Container,
  CreditCard,
  Database,
  Layers,
  Mail,
  MonitorCheck,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LogoMark } from "../logo";

// Positions are % of the stage; duration/delay give each chip its own drift.
const CHIPS = [
  { icon: Layers, label: "Next.js 16", x: 8, y: 14, d: 6.5, delay: 0 },
  { icon: Database, label: "Supabase", x: 78, y: 10, d: 7.2, delay: 0.8 },
  {
    icon: CreditCard,
    label: "Stripe",
    x: 84,
    y: 46,
    d: 6.1,
    delay: 1.6,
    note: "Webhook verified · duplicate ignored",
  },
  { icon: Sparkles, label: "Claude", x: 6, y: 52, d: 7.8, delay: 0.4 },
  { icon: Palette, label: "Tailwind 4", x: 18, y: 82, d: 6.8, delay: 1.2 },
  { icon: ShieldCheck, label: "pgTAP", x: 70, y: 80, d: 7.4, delay: 2 },
  { icon: Mail, label: "Resend · SMTP", x: 40, y: 6, d: 8.2, delay: 1 },
  { icon: MonitorCheck, label: "Playwright", x: 46, y: 88, d: 6.4, delay: 0.2 },
  { icon: Braces, label: "TypeScript", x: 88, y: 26, d: 7, delay: 2.4 },
  { icon: Container, label: "Docker", x: 4, y: 33, d: 7.6, delay: 1.8 },
];

/** Floating stack chips around a centre card (desktop); a plain wrapped list on phones. */
export function StackOrbit() {
  return (
    <div className="bg-grid relative overflow-hidden rounded-3xl border bg-subtle">
      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-16 text-center md:py-36">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-card shadow-md">
          <LogoMark className="size-9" />
        </span>
        <h2
          id="stack-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          The stack you&apos;d pick anyway, already wired together
        </h2>
        <p className="text-pretty text-muted-foreground">
          Auth, data, payments, email, AI, tests and deploys, each set up once, the same way, and
          documented for you and your agent.
        </p>
        <ul className="flex flex-wrap justify-center gap-2 md:hidden">
          {CHIPS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm shadow-xs"
            >
              <Icon className="size-4 text-primary" aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </div>
      <ul aria-hidden className="hidden md:block">
        {CHIPS.map(({ icon: Icon, label, x, y, d, delay, note }) => (
          <li
            key={label}
            className="absolute animate-float motion-reduce:animate-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDuration: `${d}s`,
              animationDelay: `-${delay}s`,
            }}
          >
            <span className="flex items-center gap-2 rounded-2xl border bg-card px-3.5 py-2.5 text-sm font-medium shadow-md">
              <Icon className="size-4 text-primary" /> {label}
            </span>
            {note && (
              <span className="absolute top-full right-0 mt-2 w-max max-w-52 rounded-lg bg-instrument px-3 py-2 text-xs text-instrument-foreground shadow-md">
                {note}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
