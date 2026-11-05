import {
  Bot,
  Database,
  KeyRound,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Stethoscope,
  TestTubes,
  Workflow,
} from "lucide-react";

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
      "Email sign-up with verification, password reset, optional Google OAuth and server-side session refresh.",
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
];
