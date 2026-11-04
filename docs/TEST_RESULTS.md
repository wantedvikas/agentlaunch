# Test Results

Results exactly as they ran. Newest milestone first.

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
