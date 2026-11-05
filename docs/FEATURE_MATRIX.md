# Feature Matrix — Community vs Pro

The source of truth for what each edition includes. Status shows what is **built today**, not only what's planned.

**Status key:** ✅ shipped · 📅 planned (milestone in brackets) · — not included

**Rule of thumb:** Community includes every _basic_ SaaS capability, built to the same security and test bar. Pro adds _depth_: more providers, full billing edge cases, admin roles, AI credits, teams, mobile and premium design.

| Area                      | Feature                                                                                           | Community (MIT, free) | Pro (commercial, $119 intro)                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| **Foundation**            | Next.js App Router, TypeScript strict, pnpm, ESLint, Prettier                                     | ✅                    | ✅ inherited                                                        |
|                           | Design tokens, light/dark theme, reduced motion                                                   | ✅                    | ✅ inherited                                                        |
|                           | 22 accessible UI components (Radix-based)                                                         | ✅                    | ✅ inherited                                                        |
|                           | Marketing home and features pages                                                                 | ✅                    | ✅ + 2 premium landing compositions, 15–20 sections 📅 (P2)         |
|                           | Dashboard shell with responsive sidebar                                                           | ✅                    | ✅ + premium dashboard/account/billing pages 📅 (P2)                |
|                           | SEO metadata, sitemap, robots, OG fallback                                                        | ✅                    | ✅ inherited                                                        |
|                           | GitHub Actions CI                                                                                 | ✅                    | ✅ inherited                                                        |
| **Scaffolder**            | `npx create-agentlaunch`: choose providers and modules                                            | 📅 (C4)               | ✅ + Pro modules from the ZIP 📅 (P3); licence-key download 📅 (S3) |
| **Auth**                  | Email sign-up with verification, login, logout, password reset                                    | ✅                    | ✅ inherited                                                        |
|                           | Google OAuth                                                                                      | ✅                    | ✅ inherited                                                        |
|                           | GitHub, Microsoft, Slack OAuth                                                                    | ✅                    | ✅ inherited                                                        |
|                           | Server-side session refresh, protected dashboard                                                  | ✅                    | ✅ inherited                                                        |
| **Data**                  | `profiles` + `projects` migrations, owner-only RLS                                                | ✅                    | ✅ inherited                                                        |
|                           | Two-user RLS SQL tests                                                                            | ✅                    | ✅ + billing, admin, org tests                                      |
|                           | Project CRUD and profile settings                                                                 | ✅                    | ✅ inherited                                                        |
| **Billing**               | Stripe subscription checkout, customer portal, verified idempotent webhook, one gated page        | 📅 (C6)               | ✅ inherited                                                        |
|                           | One-time purchases, multiple plans, trials, past-due/cancel UI, refunds, reconciliation, invoices | —                     | 📅 (P1)                                                             |
|                           | Provider interface + Stripe                                                                       | —                     | 📅 (P1)                                                             |
|                           | Lemon Squeezy, Polar, Paddle, Dodo                                                                | —                     | 📅 (P4, one per release)                                            |
| **Admin**                 | Users table, headline stats, scheduled stats job, database-checked admin access                   | 📅 (C6)               | ✅ inherited                                                        |
|                           | Role-based access (RBAC), user management actions, audit log, revenue/growth charts               | —                     | 📅 (P2)                                                             |
| **AI**                    | Server-side LLM demo (key stays on the server)                                                    | 📅 (C5)               | ✅ inherited                                                        |
|                           | AI credits: balances, metered usage, plan allowances                                              | —                     | 📅 (P2)                                                             |
| **Content and email**     | Email via Resend or SMTP, welcome email                                                           | ✅                    | ✅ inherited                                                        |
|                           | React Email template set (welcome, notices, activation)                                           | —                     | 📅 (P2)                                                             |
|                           | MDX blog                                                                                          | 📅 (C5)               | ✅ inherited                                                        |
| **Storage**               | Per-user file uploads (Supabase Storage, RLS, type/size checks)                                   | 📅 (C5)               | ✅ inherited                                                        |
| **Analytics and privacy** | Plausible or Google Analytics, cookie-consent banner                                              | ✅                    | ✅ inherited                                                        |
| **Teams**                 | Organizations, invites, roles, org-scoped RLS                                                     | —                     | 📅 (P5, Pro v1.x)                                                   |
| **i18n**                  | Multiple languages                                                                                | —                     | 📅 (P6, Pro v1.x)                                                   |
| **Mobile**                | React Native (Expo) app on the same backend, in-app purchases                                     | —                     | 📅 (M1, Pro v2)                                                     |
| **Developer experience**  | `pnpm run doctor` (env and setup checks)                                                          | ✅                    | ✅ + advanced checks 📅 (P2)                                        |
|                           | AGENTS.md / CLAUDE.md recipes, Claude Code skills, Cursor rules, `llms.txt`                       | ✅                    | ✅ + Pro recipes                                                    |
|                           | Deploy guides: Vercel, Docker, Railway, Fly                                                       | ✅                    | ✅ + deployment cookbook 📅 (P2)                                    |
|                           | Playwright tests                                                                                  | ✅                    | ✅ + billing E2E suite 📅 (P1)                                      |
| **Licence**               | MIT                                                                                               | ✅                    | inherited files only                                                |
|                           | Commercial licence: 1 developer, unlimited own apps, 12 months of updates                         | —                     | 📅 (P3)                                                             |

## Not planned at launch

A visual/no-code builder, prompt-to-app generation, databases other than Supabase (a Postgres + Drizzle + Better Auth option may come later if people ask), seat billing, and an AI chat product.

Neither edition contains a runtime licence check. Your deployed app is yours.
