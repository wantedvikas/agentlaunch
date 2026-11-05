# Security checklist

What the starter does, and what **you** must do before going live. ✅ = built in and tested · ☐ = your job.

## Authentication and sessions

- ✅ Supabase Auth with HTTP-only cookie sessions via `@supabase/ssr`, refreshed in `src/proxy.ts`
- ✅ Server identity uses `getClaims()` (verified JWT), not the unverified `getSession()`
- ✅ Email confirmation required; minimum password length 8 (`supabase/config.toml`)
- ✅ Generic sign-in errors; sign-up and reset never reveal whether an account exists
- ✅ Per-IP (and per-email) rate limits on sign-in, sign-up and reset (in-memory, per instance)
- ✅ `?next=` redirects checked against an allowlist (open-redirect tests)
- ✅ Auth email links built from `NEXT_PUBLIC_SITE_URL`, not the request Host header
- ✅ Forms use POST, so credentials never land in URLs (tested with JavaScript blocked)
- ✅ Dev server doesn't log Server Action arguments (`logging.serverFunctions: false`)
- ☐ Production: custom SMTP in Supabase; set Site URL and Redirect URLs to your domain only
- ☐ Multiple server instances: replace the in-memory rate limiter with a shared store
- ☐ Consider CAPTCHA (Supabase Auth → captcha) if you see sign-up abuse

## Authorization and data

- ✅ Every query and Server Action calls `requireUser()` / `getCurrentUser()` and filters by `owner_id`
- ✅ Tables start with `revoke all` from `anon`/`authenticated`; column-level grants; clients can't set `owner_id`
- ✅ Owner-only RLS on every table; pgTAP proves two-user and anonymous denial (`pnpm db:test`)
- ✅ `security definer` functions pin `search_path = ''` and revoke execute from `public`/`anon`
- ✅ No service_role / secret key anywhere in the app; doctor fails if one is put in a `NEXT_PUBLIC_*` variable
- ☐ Every new table follows AGENTS.md Recipe 1, including its pgTAP test

## Input, output, secrets

- ✅ Zod validation on the server for every action; ids validated as UUIDs
- ✅ User values HTML-escaped in email templates
- ✅ Analytics ids validated before being placed into script URLs
- ✅ Logs carry error codes only: no emails, message bodies or keys
- ✅ `.env*` git-ignored (except `.env.example`) and excluded from Docker builds; the Docker image runs as non-root
- ☐ Store production secrets in your host's secret manager; rotate any key that was ever committed or shared

<!-- @module:uploads -->

## File uploads

- ✅ Private bucket; downloads only through 60-second signed URLs
- ✅ Storage enforces 5 MB and a type allowlist (no SVG or HTML); the server also checks the extension and sniffs the first bytes
- ✅ Storage policies confine each user to `uploads/<user-id>/`; no overwrite or move; pgTAP + cross-user Storage API tests
- ✅ Stored names are randomised and sanitised; per-user upload rate limit
- ☐ Add malware scanning before you let users share files with each other

<!-- @end:uploads -->
<!-- @module:ai -->

## AI

- ✅ API key server-only; doctor fails if an `sk-ant-` key is in a public variable
- ✅ Signed-in users only, validated prompts, per-user rate limit, refusal handling; prompts never logged
- ☐ Set a spend limit in the Anthropic Console; review the per-user limit before launch
- ☐ Never include other users' data in prompts

<!-- @end:ai -->

<!-- @module:payments -->

## Billing

- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `SUPABASE_SECRET_KEY` are server-only variables, never `NEXT_PUBLIC_*`; `pnpm run doctor` flags them if they are.
- [ ] The webhook rejects requests whose signature doesn't verify (tested), and duplicate event ids are no-ops (tested).
- [ ] Every paid page **and** action calls `hasActiveSubscription()` on the server; hiding a button is not a paywall.
- [ ] Billing tables are read-only to users (RLS + grants, tested); only `billing_apply_event()` writes them.
- [ ] Live keys are used only in production; development uses `sk_test_` keys.

<!-- @end:payments -->

<!-- @module:admin -->

## Admin

- [ ] Admins are set only in SQL (`profiles.is_admin`); clients have no column grant to change it (tested).
- [ ] `/dashboard/admin` returns not-found for non-admins, and the admin SQL functions re-check `is_admin()` (tested).
- [ ] Review who has `is_admin = true` before each release.

<!-- @end:admin -->

## Privacy

- ✅ Google Analytics loads only after consent; Plausible is cookieless; declining removes `_ga` cookies
- ☐ Publish a privacy policy and terms (have them reviewed), and adapt the banner text to your jurisdiction

## Before each release

- ☐ `pnpm check && pnpm db:test && pnpm test:e2e` green
- ☐ `pnpm audit --prod` reviewed
- ☐ A secret scan over the diff and the history is clean
