# Feature Matrix — Community vs Pro

This page is the source of truth for what each edition includes. Status shows what is **built today**, not what is planned.

**Status key:** ✅ shipped · 📅 planned for that edition · — not included

| Area                     | Feature                                                                   | Community (MIT, free) | Pro (commercial, $119 intro) |
| ------------------------ | ------------------------------------------------------------------------- | --------------------- | ---------------------------- |
| **Foundation**           | Next.js App Router, TypeScript strict, pnpm, ESLint, Prettier             | ✅                    | 📅                           |
|                          | Design tokens, light/dark theme, reduced motion                           | ✅                    | 📅                           |
|                          | ~20 accessible UI components (Radix-based)                                | ✅                    | 📅                           |
|                          | Marketing home and features pages                                         | ✅                    | 📅                           |
|                          | Dashboard shell with responsive sidebar                                   | ✅                    | 📅                           |
|                          | SEO metadata, sitemap, robots, OG fallback                                | ✅                    | 📅                           |
|                          | GitHub Actions CI (lint, typecheck, test, build)                          | ✅                    | 📅                           |
| **Auth**                 | Email sign-up, verification, login, logout                                | 📅                    | 📅                           |
|                          | Password reset                                                            | 📅                    | 📅                           |
|                          | Optional Google OAuth                                                     | 📅                    | 📅                           |
|                          | Server-side session refresh, protected dashboard                          | 📅                    | 📅                           |
| **Data**                 | `profiles` + `projects` migrations, owner-only RLS                        | 📅                    | 📅                           |
|                          | Two-user RLS SQL tests                                                    | 📅                    | 📅                           |
|                          | Project CRUD with validation and full UI states                           | 📅                    | 📅                           |
|                          | Profile settings                                                          | 📅                    | 📅                           |
| **Developer experience** | `pnpm doctor` (basic env/setup checks)                                    | 📅                    | 📅                           |
|                          | Advanced `doctor` (providers, webhooks, migration status)                 | —                     | 📅                           |
|                          | AGENTS.md / CLAUDE.md with recipes                                        | 📅                    | 📅                           |
|                          | Playwright smoke tests                                                    | ✅                    | 📅                           |
|                          | Billing E2E tests, Stripe CLI guide, deploy cookbook                      | —                     | 📅                           |
| **Billing**              | Stripe Checkout: subscription and one-time                                | —                     | 📅                           |
|                          | Customer Portal                                                           | —                     | 📅                           |
|                          | Verified, idempotent webhooks with reconciliation                         | —                     | 📅                           |
|                          | Server-enforced entitlements and gated page demo                          | —                     | 📅                           |
|                          | Billing account page (plan, status, renewal, invoices)                    | —                     | 📅                           |
| **Content and email**    | Resend + React Email templates                                            | —                     | 📅                           |
|                          | MDX blog with 3 demo posts                                                | —                     | 📅                           |
| **Storage**              | Secure per-user file uploads with storage RLS                             | —                     | 📅                           |
| **Design**               | Basic marketing sections                                                  | ✅                    | 📅                           |
|                          | Two premium landing compositions, 15–20 sections                          | —                     | 📅                           |
| **Licence**              | MIT                                                                       | ✅                    | inherited files only         |
|                          | Commercial licence: 1 developer, unlimited own apps, 12 months of updates | —                     | 📅                           |

## Not in either edition at launch

Organizations and multi-tenancy, seat billing, an admin console, AI chat, usage metering, a no-code builder, and Dodo Payments as a starter-kit provider. Some of these may appear in a later Studio/Teams edition, which is **not for sale**.

Neither edition contains a runtime licence check. Your deployed app is yours.
