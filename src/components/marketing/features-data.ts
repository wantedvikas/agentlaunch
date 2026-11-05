import {
  Bot,
  Database,
  KeyRound,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Stethoscope,
  Terminal,
  TestTubes,
  Workflow,
} from "lucide-react";
// @module:email
import { Mail } from "lucide-react";
// @end:email
// @module:blog
import { Newspaper } from "lucide-react";
// @end:blog
// @module:uploads
import { FileUp } from "lucide-react";
// @end:uploads
// @module:ai
import { Sparkles } from "lucide-react";
// @end:ai
// @module:payments
import { CreditCard } from "lucide-react";
// @end:payments
// @module:admin
import { UserCog } from "lucide-react";
// @end:admin

import type { Feature } from "./feature-grid";

/**
 * Feature copy describes the *finished* Community edition. `status` marks what this
 * build already includes, so marketing never claims unshipped work. Keep in sync
 * with docs/FEATURE_MATRIX.md.
 */
export const coreFeatures: readonly (Feature & { status: "ready" | "planned" })[] = [
  {
    icon: Palette,
    title: "Design system with tokens",
    description:
      "Color, type, radius, shadow and motion tokens drive every component. Light and dark themes, visible focus, reduced motion.",
    status: "ready",
  },
  {
    icon: LayoutDashboard,
    title: "Marketing site and dashboard shell",
    description:
      "Responsive marketing pages, a mobile drawer and a desktop sidebar dashboard, all with loading, empty and error states.",
    status: "ready",
  },
  {
    icon: Bot,
    title: "Built for coding agents",
    description:
      "Small typed feature modules, one obvious pattern per job, and AGENTS.md / CLAUDE.md guides with step-by-step recipes.",
    status: "ready",
  },
  {
    icon: KeyRound,
    title: "Supabase authentication",
    description:
      "Email sign-up with verification, password reset, optional Google, GitHub, Microsoft and Slack sign-in, and server-side session refresh.",
    status: "ready",
  },
  {
    icon: Database,
    title: "Row-level security by default",
    description:
      "Migration-managed tables with owner-only policies and SQL tests proving one user can't read another's data.",
    status: "ready",
  },
  {
    icon: Stethoscope,
    title: "pnpm run doctor",
    description:
      "A read-only setup check that explains missing configuration without ever printing a secret.",
    status: "ready",
  },
  {
    icon: TestTubes,
    title: "Tests and CI included",
    description:
      "Vitest unit tests, Playwright smoke tests and a GitHub Actions workflow from day one.",
    status: "ready",
  },
  {
    icon: ShieldCheck,
    title: "Security patterns, not promises",
    description:
      "Server-side authorization in every data path, validated inputs and a documented security checklist.",
    status: "ready",
  },
  {
    icon: Workflow,
    title: "You own the code",
    description:
      "MIT licence, no proprietary runtime, no licence checks. Deploy anywhere Next.js runs.",
    status: "ready",
  },
  {
    icon: Terminal,
    title: "npx create-agentlaunch",
    description:
      "A scaffolder that asks which sign-in providers and modules you want, and removes the rest from the code.",
    status: "ready",
  },
  // @module:payments
  {
    icon: CreditCard,
    title: "Stripe subscriptions",
    description:
      "Checkout, the Customer Portal and a signature-verified webhook that ignores duplicate events. Paid pages are checked on the server.",
    status: "ready",
  },
  // @end:payments
  // @module:admin
  {
    icon: UserCog,
    title: "Admin area",
    description:
      "Users list with search and filters, plus hourly stats. Admin access is a database flag, checked by RLS.",
    status: "ready",
  },
  // @end:admin
  // @module:email
  {
    icon: Mail,
    title: "Transactional email",
    description: "Resend or any SMTP provider, with a welcome email that is sent exactly once.",
    status: "ready",
  },
  // @end:email
  // @module:blog
  {
    icon: Newspaper,
    title: "MDX blog",
    description: "Write posts as MDX files. Front matter is validated at build time.",
    status: "ready",
  },
  // @end:blog
  // @module:uploads
  {
    icon: FileUp,
    title: "Private file uploads",
    description:
      "Per-user folders in Supabase Storage, type and size checks, and short-lived links.",
    status: "ready",
  },
  // @end:uploads
  // @module:ai
  {
    icon: Sparkles,
    title: "AI assistant example",
    description:
      "Claude called from the server, rate-limited per user. Your API key never reaches the browser.",
    status: "ready",
  },
  // @end:ai
];
