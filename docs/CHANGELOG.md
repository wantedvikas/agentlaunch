# Changelog

All notable changes to AgentLaunch Community. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

## [Unreleased] (milestone C6)

### Added

- **Stripe billing (basic)**:
  - **Plan and pages:** one subscription plan. `/pricing` shows it, and `/dashboard/billing` covers Checkout, the Customer Portal and the status.
  - **Paid-only example:** `/dashboard/premium` with a CSV export that is checked on the server.
  - **Webhook:** `POST /api/stripe/webhook` verifies the signature over the raw body, and `billing_apply_event()` applies each event in one transaction. Duplicate event ids are no-ops, and an older event never overwrites a newer state.
  - **Tables:** `billing_customers`, `billing_subscriptions` and `billing_events`. Users can only read their own rows (RLS).
  - **No new dependency:** Stripe is called over its REST API with `fetch`.
  - **Guide:** `docs/BILLING.md`.
- **Basic admin**:
  - **Access:** `profiles.is_admin` (set in SQL only), `is_admin()` and `requireAdmin()`. `/dashboard/admin` returns not-found for anyone else.
  - **Users:** a list with search and All / Paying / Admins filters (`admin_list_users()`).
  - **Stats:** headline numbers (users, paying users, revenue) in `daily_stats`, refreshed hourly by pg_cron or on demand by an admin.
  - **Seed data:** a local admin account.
- **CLI modules:** `payments` and `admin` (`--no-payments`, `--no-admin`). The CI matrix now builds 10 variants.
- **`pnpm run doctor`** checks the Stripe key, price and webhook secret, and that `SUPABASE_SECRET_KEY` is set. It also flags `sk_test_`, `rk_` and `whsec_` values in public variables.

### Verified

- A real Stripe test-mode run worked end to end: Checkout, then the signed webhook, then paid access, then the Portal cancellation, then immediate cancellation, which locks the page. The run caught that current Stripe API versions schedule a cancellation with `cancel_at` rather than `cancel_at_period_end`; both are handled now.

### Changed

- AGENTS.md rule 12 now allows the Supabase secret key in exactly one place: the signature-verified Stripe webhook.

## [0.3.0] — 2026-11-06 (milestone C5)

### Added

- **MDX blog** (`/blog`, `/blog/[slug]`) with 3 labelled demo posts. The build validates each post's front matter. Posts get metadata, Open Graph tags and sitemap entries, and styles come from the design tokens.
- **Private file uploads** (`/dashboard/files`) in Supabase Storage:
  - Bucket rules: 5 MB limit and a type allowlist, enforced by Storage itself.
  - Server checks: extension and content sniffing.
  - Access: per-user folder policies, 60-second signed download links, and a per-user rate limit.
  - Tests: pgTAP and cross-user Storage API tests.
- **AI assistant example** (`/dashboard/ai`): a Server Action calling Claude (`claude-opus-5-5`) through the official SDK.
  - Short, cheap answers: low effort and short replies.
  - Safety: refusal fallbacks, typed error handling, a per-user rate limit, and prompts are never logged.
  - Setup: a clear "not configured" state without `ANTHROPIC_API_KEY`. Guide: `docs/AI.md`.
- CLI modules `blog`, `uploads` and `ai` (`--no-blog`, `--no-uploads`, `--no-ai`); the CI matrix now builds 8 variants.
- `pnpm run doctor` flags Anthropic (`sk-ant-`) and live Stripe keys in public variables, and warns when AI isn't configured.

### Fixed

- Horizontally scrollable code blocks and tables weren't keyboard-focusable on small screens (axe `scrollable-region-focusable`). The axe suite now runs at 375px as well as 1440px.

## [0.2.0] — 2026-11-05 (milestone C4)

### Added

- `create-agentlaunch` CLI (`packages/create-agentlaunch`): `npx create-agentlaunch my-app` asks for an app name, social sign-in providers, and the email, analytics and Docker modules, then downloads the template at the matching release tag, removes unchosen modules (files, marked code blocks, migrations, tests, npm dependencies) and template-repo files, renames the project (package, app name, Supabase project id), writes a project README, installs, formats and makes an initial git commit. `--yes` plus flags for non-interactive use. No runtime dependencies.
- `@module:<id>` / `@end:<id>` markers in shared template files; the CLI fails if any are unbalanced or left over.
- CLI workflow: unit tests plus a generation matrix (full, minimal, no-email, no-analytics, no-docker), each running format, lint, typecheck, unit and build; full and minimal also run pgTAP, doctor and E2E.

### Changed

- `pnpm run doctor` probes migrations through `TABLE_PROBES` / `RPC_PROBES` lists, so a project without a module isn't reported as "behind".
- The welcome-email E2E assertion uses `siteConfig.name`, so it passes after an app is renamed.

## [0.1.0] — 2026-11-05 (milestones C1–C3)

### Added (milestone C3)

- Social sign-in for Google, GitHub, Microsoft and Slack from one `NEXT_PUBLIC_AUTH_PROVIDERS` list; the server rejects unlisted providers.
- Email transport (`resend` / `smtp` / `log`) and a welcome email sent once per user, guaranteed by an atomic `claim_welcome_email()` database function (with pgTAP tests).
- Plausible and Google Analytics, with a cookie-consent banner. GA loads only after consent; declining removes `_ga` cookies; "Cookie preferences" in the footer.
- `pnpm run doctor`: checks the toolchain, env shape, a secret key in a public variable, Supabase reachability, migrations applied, RLS denying anonymous access, and listed providers enabled. Never prints values.
- Production `Dockerfile` (standalone output, non-root) and `.dockerignore`; deploy guide for Vercel, Docker, Railway and Fly.
- AGENTS.md rewritten with a map and recipes; Claude Code skills (`.claude/skills/`), a Cursor rule, and `public/llms.txt`.
- axe accessibility tests (WCAG 2.1 AA) on public and dashboard pages in both themes; Playwright tests for OAuth redirect, welcome email and consent.
- Docs: `EMAIL_AND_ANALYTICS.md`, `DEPLOY.md`, `TROUBLESHOOTING.md`, `SECURITY_CHECKLIST.md`, `RELEASE_CHECKLIST.md`.

### Changed

- `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` is replaced by `NEXT_PUBLIC_AUTH_PROVIDERS` (e.g. `google,github`).
- Requires Node 22.18+ (built-in TypeScript for `doctor`).
- Light-theme `success` and `destructive` tokens darkened slightly for 4.5:1 badge contrast.

### Fixed

- `pnpm build` failed on a fresh clone before Supabase was configured (found by the first GitHub Actions run). The config check now runs at request time, and an unconfigured app sends dashboard visitors to the login page's setup notice.
- The Overview stats list had invalid `<dl>` structure, which screen readers announced incorrectly.
- A success badge's text contrast was 4.48:1, below the AA minimum.

## Milestone C2

### Added (milestone C2)

- Supabase Auth through `@supabase/ssr`: sign-up with email confirmation, sign-in, sign-out, password reset, optional Google OAuth, `/auth/callback` code exchange, and session refresh in `src/proxy.ts`.
- Migration `profiles` + `projects` with explicit least-privilege grants, owner-only RLS, a sign-up trigger, `updated_at` triggers and an index.
- 22 pgTAP authorization tests (two users plus anonymous), a seeded local demo user and project, and generated database types.
- Project CRUD and profile settings through Server Actions, re-validated with Zod, plus a server-side `requireUser()` data-access layer.
- Open-redirect guard for `?next=`, generic auth errors, and an in-memory per-IP rate limit on auth actions.
- Playwright auth/CRUD flows using local Mailpit; CI now starts local Supabase.
- Docs: `docs/LOCAL_SUPABASE.md`, `docs/AUTH_SETUP.md`.

### Changed

- The dashboard requires sign-in; the C1 "preview mode" notice is removed. Marketing CTAs now point to sign-in and sign-up.

### Fixed

- Email addresses with surrounding spaces were rejected (validation ran before trimming).
- Forms submitted before JavaScript loads could put the email and password in the URL. All forms now use `method="post"`.
- The dev server printed Server Action arguments, including sign-in passwords, to the terminal. `logging.serverFunctions` is now off.
- Next's dev badge covered the sidebar's "Back to site" link; it's moved to the bottom-right.

### Added (milestone C1)

- Next.js 16.4.5 + React 19.3 + TypeScript strict + Tailwind CSS 4 scaffold with pnpm.
- Design tokens; light/dark/system theme with no flash on first load; reduced-motion support.
- 22 accessible UI components.
- Marketing home and features pages, mobile navigation, a dashboard shell (preview mode), and a projects form dialog with Zod validation.
- 404, error, global-error and loading states; metadata, sitemap, robots, an OG image and an SVG icon.
- Vitest unit tests, Playwright smoke tests (desktop and mobile), and a GitHub Actions CI workflow.
- MIT licence, README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates, `.env.example`.
