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

## Optional: social sign-in (Google, GitHub, Microsoft, Slack)

Buttons render only for providers listed in `NEXT_PUBLIC_AUTH_PROVIDERS` (for example `google,github`). The server action also rejects any provider that isn't listed. `pnpm run doctor` warns if a listed provider isn't enabled in Supabase.

| Provider  | id           | Create the OAuth app at                                                                       |
| --------- | ------------ | --------------------------------------------------------------------------------------------- |
| Google    | `google`     | Google Cloud Console → APIs & Services → Credentials (Web application)                        |
| GitHub    | `github`     | GitHub → Settings → Developer settings → OAuth Apps                                           |
| Microsoft | `azure`      | Microsoft Entra admin center → App registrations (we request the `email` scope automatically) |
| Slack     | `slack_oidc` | api.slack.com/apps → OAuth & Permissions (Sign in with Slack / OpenID)                        |

For every provider, the **callback / redirect URI** to register is:

- Local: `http://127.0.0.1:54321/auth/v1/callback`
- Hosted: `https://<project-ref>.supabase.co/auth/v1/callback`

**Local setup:**

1. Put the credentials in `supabase/.env` (git-ignored):
   ```bash
   SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=...
   SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=...
   ```
   The names follow `SUPABASE_AUTH_EXTERNAL_<ID>_CLIENT_ID` / `_SECRET`, with the id in upper case (`GOOGLE`, `GITHUB`, `AZURE`, `SLACK_OIDC`).
2. In `supabase/config.toml`, set `enabled = true` under that provider's `[auth.external.<id>]` block. Run `pnpm db:stop && pnpm db:start`.
3. Add the id to `NEXT_PUBLIC_AUTH_PROVIDERS` in `.env.local` and restart `pnpm dev`.

**Hosted:** Supabase dashboard → Authentication → Providers, then set `NEXT_PUBLIC_AUTH_PROVIDERS` in your host's env and redeploy.

Automated tests cover the button → provider redirect. A full sign-in with a real provider needs real credentials and isn't automated.

## Production email

Local email goes to Mailpit. Supabase's built-in hosted email service has low send limits. Configure custom SMTP (Authentication → SMTP) before launch.
