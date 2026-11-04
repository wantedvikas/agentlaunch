# Changelog

All notable changes to AgentLaunch Community. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

## [Unreleased]

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
