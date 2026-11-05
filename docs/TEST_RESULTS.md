# Test Results

Results exactly as they ran. Newest milestone first.

## C3 — 2026-11-05 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1, Supabase CLI 3.0.0, Docker 29.8.2)

| Check               | Command                                                                                          | Result                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Formatting          | `pnpm format:check`                                                                              | ✅                                                                               |
| Lint                | `pnpm lint`                                                                                      | ✅ 0 errors, 0 warnings                                                          |
| Typecheck           | `pnpm typecheck`                                                                                 | ✅                                                                               |
| Unit tests          | `pnpm test`                                                                                      | ✅ 65 passed, 5 files                                                            |
| Build               | `pnpm build`                                                                                     | ✅                                                                               |
| pgTAP               | `pnpm db:test`                                                                                   | ✅ 27/27 (2 files)                                                               |
| E2E + accessibility | `pnpm test:e2e`                                                                                  | ✅ 42 passed (41 + demo sign-in setup), 35 skipped by design                     |
| Setup check         | `pnpm run doctor`                                                                                | ✅ (plus negative cases in unit tests)                                           |
| Docker image        | `docker build` + run                                                                             | ✅ `/` 200, `/login` 200, `/dashboard` → 307 to login, `/robots.txt` 200; 301 MB |
| Clean-clone dry run | committed files only → `pnpm install --frozen-lockfile` → `.env.example` → doctor → `pnpm check` | ✅                                                                               |
| Dependency audit    | `pnpm audit --prod`                                                                              | ✅ no known vulnerabilities                                                      |
| Secret scan         | key patterns over all tracked and untracked files                                                | ✅ (only hit is the pattern itself in RELEASE_CHECKLIST.md)                      |

**New coverage:**

- **Unit:**
  - OAuth provider parsing.
  - Email transports: log never prints the recipient; Resend request shape; failures never log addresses or keys; `EMAIL_FROM` required.
  - Welcome template HTML escaping.
  - Analytics id validation (rejects script injection).
  - Doctor: Node/pnpm, secret keys in public vars (sb_secret and service_role JWT) without echoing them, email requirements, missing tables, database behind, anonymous read allowed, provider disabled, server down.
- **pgTAP:** welcome claim succeeds once only; clients can't reset `welcomed_at`; anon can't call the function.
- **E2E:**
  - GitHub button sends the browser to Supabase `authorize?provider=github` with the callback `redirect_to`; unlisted providers get no button.
  - Exactly one welcome email arrives over real SMTP (Mailpit), even after later sign-ins.
  - GA makes no request before consent, then loads with the right id after "Accept".
  - "Essential only" keeps GA off; "Cookie preferences" reopens the banner.
  - axe WCAG 2.1 AA (serious/critical) passes on 6 public and 3 dashboard pages in light and dark, plus the consent banner.

**Skipped by design (35):** 20 screenshot captures; 7 account-creating or OAuth flows on mobile; 5 axe runs on mobile (axe is layout-independent, so it runs once, on desktop); 3 viewport-specific tests.

**Bugs found and fixed by these tests:**

- **Invalid `<dl>` structure** in the Overview stats.
- **Success-badge contrast** of 4.48:1, below the AA minimum.
- **Banner in screenshots:** the docs screenshots would have shown the cookie banner.

### Not run in C3

- **Real OAuth sign-in** with Google, GitHub, Microsoft or Slack: needs the owner's OAuth apps. The redirect is tested.
- **Resend live send:** needs a Resend key. The request shape is unit-tested and SMTP is tested for real.
- **Railway / Fly / Vercel deploys:** need accounts. The Docker image itself was built and run.
- **GitHub Actions:** no remote yet. The workflow now also runs `pnpm run doctor`.
- **External tester install, hosted demo, v0.1.0 tag:** owner steps.
- **Firefox/WebKit, measured contrast beyond axe's checks, real screen readers:** not run.

## C2 — 2026-11-04 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1, Supabase CLI 3.0.0, Docker 29.8.2)

| Check       | Command                                   | Result                                                                     |
| ----------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| Formatting  | `pnpm format:check`                       | ✅                                                                         |
| Lint        | `pnpm lint`                               | ✅ 0 errors, 0 warnings                                                    |
| Typecheck   | `pnpm typecheck`                          | ✅                                                                         |
| Unit tests  | `pnpm test`                               | ✅ 35 passed, 3 files                                                      |
| Build       | `pnpm build`                              | ✅ 16 routes (dashboard and login partially prerendered; callback dynamic) |
| RLS (pgTAP) | `pnpm db:test`                            | ✅ 22/22                                                                   |
| E2E         | `pnpm test:e2e`                           | ✅ 31 passed, 29 skipped by design                                         |
| Screenshots | `SCREENSHOTS=1 pnpm test:e2e screenshots` | ✅ 20 images                                                               |

**pgTAP coverage:** RLS enabled on both tables; the sign-up trigger creates a profile; A creates, reads, updates and deletes own rows; `owner_id` defaults to the caller and can't be reassigned; DB length constraint; B can't read, update or delete A's projects or profile (verified as table owner afterwards); B can't insert a project owned by A; clients can't insert profiles; anonymous users can't read or write either table.

**E2E coverage added:** signed-out redirect with `next`; wrong-password generic error; off-site `next` ignored after login; sign-up → Mailpit confirmation → welcome → create / edit / status change / reload persistence / delete → profile save → sign out → dashboard blocked; two separate users can't see each other's projects or the seeded demo project; password reset through email → new password works; a form submitted before hydration doesn't leak credentials into the URL; the signed-in dashboard has no overflow or console errors at 375px and 1440px.

**Skipped by design:** 20 screenshot captures (need `SCREENSHOTS=1`), 6 account-creating flows on mobile (run on desktop only, to stay within auth rate limits), and 3 viewport-specific tests.

**Bugs found and fixed by these tests:** email trimmed after validation; credentials could land in the URL before hydration; `Date.now()` in supabase-js during runtime prefetch (fixed with `connection()` in the server client).

### Not run in C2

- **Google OAuth:** needs real Google credentials.
- **GitHub Actions:** no remote yet. The workflow now starts local Supabase and runs `db:test` and e2e.
- **Hosted Supabase project:** only the local stack was tested.
- **Expired-session behaviour:** server actions return "Your session has ended" when there is no user, but a real token expiry wasn't simulated.
- **Automated a11y audit (axe), measured contrast, Firefox/WebKit:** still pending (C3).

## C1 — 2026-11-04 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1)

| Check       | Command                                                   | Result                              |
| ----------- | --------------------------------------------------------- | ----------------------------------- |
| Formatting  | `pnpm format:check`                                       | ✅ all files formatted              |
| Lint        | `pnpm lint`                                               | ✅ 0 errors, 0 warnings             |
| Typecheck   | `pnpm typecheck`                                          | ✅ 0 errors                         |
| Unit tests  | `pnpm test`                                               | ✅ 15 passed, 2 files               |
| Build       | `pnpm build`                                              | ✅ 11 routes, all static            |
| E2E smoke   | `pnpm test:e2e`                                           | ✅ 19 passed, 19 skipped (see note) |
| Screenshots | `SCREENSHOTS=1 pnpm test:e2e screenshots`                 | ✅ 16 images in `docs/screenshots/` |
| Secret scan | grep for Stripe/Supabase key patterns, JWTs, private keys | ✅ no matches                       |

**Note on skips:** 3 tests only apply at one viewport (mobile menu ×2, desktop sidebar), so they skip on the other. The 16 screenshot tests only run when `SCREENSHOTS=1` is set.

**E2E coverage (desktop 1440px and mobile 375px):** home CTA navigation, no horizontal overflow on all 5 pages, no console errors or hydration warnings on all 5 pages, skip link focus, theme toggle persists across reload, robots/sitemap/OG image served, branded 404 with status 404, mobile marketing menu, mobile dashboard drawer closes after navigating, sidebar `aria-current`, project dialog validation, Escape closes the dialog and returns focus.

**Unit coverage:** `cn` merging, theme resolution, nav active-path matching, project schema (valid input, trimming, 4 invalid cases), Button loading state, FormField aria wiring, ProjectFormDialog validation → honest "Not saved" notice.

### Not run in C1

- **GitHub Actions CI:** the workflow file exists, but no GitHub remote has been created yet.
- **Automated accessibility audit (axe):** planned for C3. C1 relies on Radix primitives, keyboard tests and manual review.
- **Measured color contrast:** tokens were chosen to aim for WCAG AA, but no contrast tool has checked them yet.
- **Browsers other than Chromium:** Firefox and WebKit are not run.
