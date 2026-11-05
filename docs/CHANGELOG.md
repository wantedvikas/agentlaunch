# Changelog

All notable changes to AgentLaunch Community. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

## [Unreleased] — 0.1.0 release candidate

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
