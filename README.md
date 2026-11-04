# AgentLaunch Community

**A SaaS starter coding agents can work with:** Next.js, Supabase and a polished, accessible design system, under the MIT licence.

> **Status: v0.1.0 in development (milestone C2 of 3).** The UI, Supabase auth and per-user data with row-level security work today. `pnpm doctor` and the full docs arrive in C3. See [docs/FEATURE_MATRIX.md](docs/FEATURE_MATRIX.md) for exactly what's shipped.

![Home page, desktop](docs/screenshots/home-desktop-light.png)

## Who it's for

Solo founders and developers, including people building with AI coding agents, who want a clean, typed foundation they can change confidently.

## What works today

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, pnpm
- A design-token system (color, type, radius, shadow, motion), light/dark/system themes with no flash on load, and reduced-motion support
- 22 accessible UI components on Radix primitives: button, input, textarea, select, checkbox, switch, tabs, card, badge, dialog, sheet, dropdown menu, toast, table, skeleton, alert, avatar, separator, label, form field, empty state, error state
- Marketing home and features pages, mobile navigation, and a dashboard shell with a sidebar and mobile drawer
- Branded 404, error and loading states; metadata, sitemap, robots and a generated Open Graph image
- Vitest unit tests, Playwright smoke tests at 375px and 1440px, and GitHub Actions CI

- Supabase Auth: email sign-up with confirmation, sign-in, sign-out, password reset, and optional Google OAuth. Sessions are refreshed in `src/proxy.ts`
- `profiles` and `projects` tables with explicit grants and owner-only row-level security, proven by 22 pgTAP tests (two users plus anonymous)
- Project create / edit / delete and profile settings, with Zod validation on client and server, toasts, and empty, loading and error states
- An open-redirect guard on `?next=`, generic auth errors (no account enumeration), and per-IP rate limits on auth actions

## Quickstart

Requires Node 22+.

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local
pnpm db:start                     # needs Docker; see docs/LOCAL_SUPABASE.md
pnpm exec supabase status         # copy API URL + Publishable key into .env.local
pnpm dev                          # http://localhost:3000
```

Sign up at `/signup`, then open the confirmation email in Mailpit at http://127.0.0.1:54324. Or sign in with the local demo account `demo@agentlaunch.local` / `demo-password-123`, which is seeded locally only.

## Scripts

| Command                                                     | What it does                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`                                                  | Dev server                                                                               |
| `pnpm check`                                                | Lint + typecheck + unit tests + production build                                         |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` | Individual checks                                                                        |
| `pnpm format` / `pnpm format:check`                         | Prettier                                                                                 |
| `pnpm test:e2e`                                             | Playwright against a production build (run `pnpm exec playwright install chromium` once) |
| `SCREENSHOTS=1 pnpm test:e2e screenshots`                   | Regenerate `docs/screenshots/`                                                           |

## Project structure

```
src/
  app/
    (marketing)/       /, /features
    (auth)/            /login, /signup, /reset-password
    (dashboard)/       /dashboard, /dashboard/projects, /dashboard/settings
    auth/callback/     email-link and OAuth code exchange
  components/
    ui/                design-system primitives
    marketing/         header, footer, sections
    dashboard/         sidebar nav, page header
    theme/             theme script and toggle
  features/            one folder per feature: schema.ts, actions.ts, queries.ts, components/
  config/site.ts       app name, nav, links: rebrand here
  lib/supabase/        server client, proxy session refresh, generated DB types
  lib/permissions/     requireUser(): server-side auth for every data path
  proxy.ts             session refresh + signed-out redirect
supabase/migrations, supabase/tests, supabase/seed.sql
tests/unit, tests/e2e
docs/                  feature matrix, changelog, test results, screenshots
```

## Customising

- **Rename the app:** edit `src/config/site.ts`.
- **Change the look:** edit the tokens in `src/app/globals.css`. Each token has a light value and a `.dark` value.
- **Environment:** see `.env.example`. The two Supabase variables are required.
- **Auth details and Google OAuth:** [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

## Community vs Pro

Pro is a commercial edition **in development and not for sale yet**. It is planned to add Stripe billing, email, a blog, file uploads and premium layouts. Community stays fully usable on its own. See [docs/FEATURE_MATRIX.md](docs/FEATURE_MATRIX.md).

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

## Licence

[MIT](LICENSE). Your deployed app contains no licence checks and no dependency on us.
