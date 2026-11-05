# Test Results

Results exactly as they ran. Newest milestone first.

## C6 — 2026-11-05 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1, Supabase CLI 3.0.0)

| Check                                                                                             | Result                             |
| ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Template: format, lint (0 warnings), typecheck, build                                             | ✅                                 |
| Template: unit                                                                                    | ✅ 90 passed                       |
| Template: pgTAP                                                                                   | ✅ 67/67 (5 files)                 |
| Template: E2E (desktop + mobile, axe at both widths)                                              | ✅ 63 passed, 36 skipped by design |
| Template: doctor                                                                                  | ✅                                 |
| CLI unit                                                                                          | ✅ 12/12                           |
| Generated **full** app (`--providers github`): static, unit 90, pgTAP 67, doctor, E2E 63          | ✅                                 |
| Generated **minimal** app (all 8 optional modules off): static, unit 52, pgTAP 22, doctor, E2E 41 | ✅                                 |
| Generated `--no-payments` / `--no-admin`: format, lint, typecheck, unit (80 / 90), build          | ✅                                 |

**New coverage:**

- **Billing pgTAP:**
  - Event handling: an event is applied once; a duplicate event id is a no-op; a stale event can't overwrite newer state; a subscription is found through its customer id; an unknown customer is ignored; the invoice amount is recorded.
  - Access: users read only their own rows; they can't insert or update subscriptions, call `billing_apply_event` or read the event log; anon is denied.
- **Admin pgTAP:**
  - The stats job is scheduled.
  - A regular user can't list users, refresh or read stats, see other profiles, or set `is_admin`.
  - An admin can search users, filter to admins, read all profiles and refresh stats; anon is denied.
- **Unit:**
  - Webhook signatures: valid, wrong secret, changed body, garbage header, a replay outside 5 minutes, and multiple `v1` values.
  - Events: mapping for each handled type (including the period end on newer API versions); envelope validation.
  - Other: CSV quoting and formula neutralising; doctor checks for Stripe and the secret key.
- **E2E:**
  - Webhook signatures: an unsigned or wrongly signed webhook returns 400.
  - Access over time: a signed subscription event unlocks `/dashboard/premium`, and the CSV downloads; resending it reports `duplicate`; the user's RLS read sees only their own rows; a cancellation makes the still-open export action fail on the server and locks the page.
  - "Not configured" state: without Stripe keys the billing page says so and shows no Subscribe button.
  - Admin access: a non-admin gets not-found and no Admin menu item; an admin sees stats, searches, filters and refreshes; the axe suite covers `/pricing`, `/dashboard/billing` and `/dashboard/premium`.

**Found and fixed by these checks:**

- **Sign-up limit:** the billing test's extra sign-up exceeded the per-IP sign-up limit, so it now uses the seeded demo user with fresh ids.
- **Duplicate toast text:** the toast's live-region copy made a text locator ambiguous.
- **Nested markers:** module markers ended up nested inside the `ai` block in AGENTS.md (the CLI rejected them).

**Documented behaviour:** `/dashboard/admin` for a non-admin renders the not-found page with HTTP 200 plus noindex. That's the same Next 16 streaming behaviour as unknown blog slugs.

### Real Stripe test-mode run (2026-11-05, Stripe Sandbox, API version `2026-10-28`, Stripe CLI `stripe listen`)

| Step                                                                                                                                                                                                                  | Result       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Subscribe → hosted Checkout (`cs_test_`) → test card 4242 → back to `/dashboard/billing?checkout=success`                                                                                                             | ✅           |
| Real Stripe-signed `checkout.session.completed`, `customer.subscription.created` and `invoice.paid` verified and applied (forwarded with `stripe events resend`, because the listener wasn't running at payment time) | ✅           |
| Plan shows **active · Renews on Dec 5, 2026**; `/dashboard/premium` unlocked; CSV export works; `invoice.paid` recorded $9.00                                                                                         | ✅           |
| The same event resent: still one event row and one subscription (duplicate ignored)                                                                                                                                   | ✅           |
| Customer Portal opens for the user's own customer; cancel at period end → **active · Ends on Dec 5, 2026**                                                                                                            | ✅ after fix |
| Cancel immediately (`stripe subscriptions cancel`) → `customer.subscription.deleted` → status `canceled`, the paid page locks, Subscribe is offered again                                                             | ✅           |

**Found and fixed by the real run:**

- **Scheduled cancellation missed:** on Stripe's current API version, a cancellation scheduled in the Portal sets `cancel_at` and leaves `cancel_at_period_end` as `false`, so the app said "Renews on". The webhook mapping now treats `cancel_at` as "ends on that date" (unit-tested).
- **Wrong wording when canceled:** a canceled plan still showed "Renews on …". The date now only shows while the plan is active.
- **Real keys reached the test server:** the browser tests picked up the real Stripe keys from `.env.local`. The test server now always runs with them blank, so tests never call Stripe.

After the fixes: unit 91 passed, E2E 63 passed / 36 skipped, lint and typecheck clean.

### Not run in C6

- **A scheduled pg_cron run:** the job's registration is tested, and the function it calls is tested directly.

## C5 — 2026-11-06 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1, Supabase CLI 3.0.0 with Storage)

| Check                                                                                                      | Result                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Template: format, lint (0 warnings), typecheck, build                                                      | ✅                                 |
| Template: unit                                                                                             | ✅ 80 passed                       |
| Template: pgTAP                                                                                            | ✅ 38/38 (3 files)                 |
| Template: E2E (desktop + mobile, axe at both widths)                                                       | ✅ 59 passed, 32 skipped by design |
| Template: doctor                                                                                           | ✅                                 |
| CLI unit                                                                                                   | ✅ 12/12                           |
| Generated **full** app (8 modules, `--providers github`): static checks, unit 80, pgTAP 38, doctor, E2E 59 | ✅                                 |
| Generated **minimal** app (all 6 optional modules off): static checks, unit 52, pgTAP 22, doctor, E2E 41   | ✅                                 |

**New coverage:**

- **Uploads:**
  - Unit: allowed types and extensions, the size and empty-file limits, and content sniffing that rejects HTML-as-PNG, an executable posing as a PDF, NUL bytes in text and SVG; plus name sanitising (traversal, unicode, length).
  - pgTAP: the bucket is private, the 5 MiB limit, no SVG, PDF allowed; the owner can upload into their own folder; nobody can upload into another user's folder or outside a folder; another user can't list; anon can't read or write.
  - E2E: upload → the signed link returns the exact bytes → delete; SVG rejected in the browser; a spoofed PNG rejected by the server; another user, through the real Storage API, can't list, sign, download, delete or upload into the owner's folder.
- **AI:**
  - Unit (SDK mocked): the not-configured state; server-side validation; request shape (`claude-opus-5-5`, `fallbacks: "default"`, the beta header, `metadata.user_id`); refusal returns no partial text; rate-limit and authentication errors mapped to friendly messages; prompts never logged; per-user rate limit.
  - E2E: the page shows "not configured" without a key.
- **Blog:** E2E checks that the index lists the 3 labelled demo posts newest-first; a post renders with its title and description metadata and the demo notice; an unknown slug shows not-found with `noindex`; posts appear in the sitemap; and the pages fit 375px with axe passing.

**Found and fixed by these checks:**

- **Not keyboard-reachable on phones:** code blocks and tables that scroll sideways on mobile (axe `scrollable-region-focusable`). Fixed, and axe now runs at both widths.
- **Lint error in no-blog apps:** `let config` in `next.config.ts` failed `prefer-const` once the blog was removed. Now a `const` plugin list.
- **Unused import:** an import that's only used by the email test.
- **Test accounts over the limit:** the suite created more accounts than the per-IP sign-up limit allows, so the upload tests now share one.

**Documented behaviour:** an unknown blog slug returns HTTP 200 with the not-found page and `<meta name="robots" content="noindex">`, because it renders after streaming starts. That's Next 16's documented behaviour; prerendered posts are unaffected.

### Not run in C5

- **Live Claude call:** costs money and needs a key; the request shape is unit-tested.
- **The no-blog, no-uploads and no-ai variants:** static checks only, in the CI matrix on push.
- **Malware scanning of uploads:** out of scope, listed in the security checklist.

## C4 — 2026-11-05 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1)

| Check                                                                                                                                            | Result   |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Template: format, lint, typecheck, unit (65), build                                                                                              | ✅       |
| Template: pgTAP 27/27, doctor, E2E 42 passed / 35 skipped                                                                                        | ✅       |
| CLI unit tests (`node --test`)                                                                                                                   | ✅ 12/12 |
| Generated **full** app (all modules, `--providers github`): format, lint, typecheck, unit 65, build, pgTAP 27/27, doctor, E2E 42 passed          | ✅       |
| Generated **minimal** app (`--no-email --no-analytics --no-docker`): format, lint, typecheck, unit 52, build, pgTAP 22/22, doctor, E2E 37 passed | ✅       |
| `npm pack`: 6 files, 7.7 kB, no tests or template shipped                                                                                        | ✅       |
| Packed CLI, default tag `v0.2.0` missing: clean "HTTP 404" error, no folder left behind                                                          | ✅       |
| Packed CLI, real GitHub download (`--template wantedvikas/agentlaunch#main`)                                                                     | ✅       |

**CLI unit coverage:** marker stripping (all comment styles; included vs excluded; blank-line collapse; untouched files); rejects unknown, unclosed, nested and stray markers; name validation (rejects `../evil`, spaces, empty); a full transform over a fixture (module and template-file removal, licence move, package rename, dependency removal, app name, Supabase project id, providers in `.env.example`, generated README).

**Found by the generated-app checks:** a doctor unit test for email checks wasn't inside the email markers, so the minimal app's unit tests failed. Fixed. An email marker placed before a closing brace was caught on review before any variant ran.

### Not run in C4

- **CLI workflow on GitHub:** runs on the next push.
- **The no-email / no-analytics / no-docker variants:** static checks only, in CI on push.
- **npm publish:** needs the owner's npm account; the name `create-agentlaunch` was free as of 2026-11-05.
- **Interactive prompt flow:** exercised manually only; CI uses `--yes`.
- **Windows:** not run (relies on `tar` in Windows 10+).

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
