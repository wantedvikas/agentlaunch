# Auth setup

## How it works

- **Email + password** through Supabase Auth, with email confirmation required (`supabase/config.toml` → `enable_confirmations = true`).
- **Sessions** are HTTP-only cookies managed by `@supabase/ssr`. `src/proxy.ts` refreshes them on each request and redirects signed-out visitors away from `/dashboard`.
- **Authorization** happens on the server in every data path: `requireUser()` / `getCurrentUser()` in `src/lib/permissions/auth.ts`. Row-level security in Postgres is the backstop.
- **Email links** (confirm, reset, OAuth) land on `/auth/callback`, which exchanges the one-time code for a session. The `next` parameter is checked against an allowlist (`src/lib/validation/redirect.ts`) to prevent open redirects.
- **Link URLs** are built from `NEXT_PUBLIC_SITE_URL`, never from request headers.
- **Rate limits:** sign-in, sign-up and reset are limited per IP (and per email) in `src/lib/rate-limit.ts`. This is in-memory and per instance; see the `shortcut:` note there. Supabase applies its own limits too.

## Flows

| Flow                    | Route                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| Sign up → confirm email | `/signup` → email → `/auth/callback?next=/dashboard`                     |
| Sign in                 | `/login` (honours a safe `?next=`)                                       |
| Forgot password         | `/reset-password` → email → `/auth/callback?next=/reset-password/update` |
| Sign out                | Account menu, or Settings → Session                                      |

Email links must be opened **in the same browser** that requested them, because the PKCE code verifier is stored in a cookie there. If someone opens a confirmation link elsewhere, the email is still confirmed and the login page asks them to sign in.

## Optional: Google OAuth

1. In Google Cloud Console, create an OAuth client (Web application).
   - Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback` (local), or `https://<project-ref>.supabase.co/auth/v1/callback` (hosted).
2. **Local:** put the credentials in `supabase/.env` (git-ignored):
   ```bash
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
   ```
   Set `enabled = true` under `[auth.external.google]` in `supabase/config.toml`, then run `pnpm db:stop && pnpm db:start`.
   **Hosted:** Authentication → Providers → Google.
3. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` in `.env.local` and restart. The "Continue with Google" button only renders when this is set.

Google sign-in is **not covered by automated tests**, because it needs real Google credentials.

## Production email

Local email goes to Mailpit. Supabase's built-in hosted email service has low send limits. Configure custom SMTP (Authentication → SMTP) before launch.
