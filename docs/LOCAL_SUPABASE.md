# Local Supabase

The app needs a Supabase project for sign-in and data. Locally, the Supabase CLI (a dev dependency) runs the whole stack in Docker.

## Requirements

- Docker Desktop (or another Docker engine), running
- Dependencies installed (`pnpm install`)

## Start

```bash
pnpm db:start          # first run downloads images; takes a few minutes
pnpm exec supabase status
```

Copy the **API URL** and the **Publishable key** into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Restart `pnpm dev` after changing env vars.

`supabase status` also prints a **secret key**. Never put it in `.env.local` with a `NEXT_PUBLIC_` prefix, and never commit it. This app doesn't need it.

## Useful URLs (local)

| What                               | URL                    |
| ---------------------------------- | ---------------------- |
| API                                | http://127.0.0.1:54321 |
| Studio (DB browser)                | http://127.0.0.1:54323 |
| Mailpit (catches every auth email) | http://127.0.0.1:54324 |

Confirmation and password-reset emails are never really sent locally. Open Mailpit to click the links.

## Demo account (local only)

`supabase/seed.sql` creates `demo@agentlaunch.local` / `demo-password-123` with one labelled demo project. Only that user can see it. The seed runs on `pnpm db:reset` and never against a hosted project.

## Commands

| Command                          | What it does                                                           |
| -------------------------------- | ---------------------------------------------------------------------- |
| `pnpm db:start` / `pnpm db:stop` | Start / stop the local stack                                           |
| `pnpm db:reset`                  | **Deletes local data**, reapplies all migrations, then runs the seed   |
| `pnpm db:test`                   | Runs the pgTAP row-level-security tests in `supabase/tests/`           |
| `pnpm db:types`                  | Regenerates `src/lib/supabase/database.types.ts` from the local schema |

## Changing the schema

1. `pnpm exec supabase migration new <name>` creates a timestamped file in `supabase/migrations/`.
2. Write SQL: the table, `revoke all ... from anon, authenticated`, minimal grants, `enable row level security`, and owner policies. Follow `20261104000000_profiles_and_projects.sql`.
3. Add a pgTAP test in `supabase/tests/` that proves user B can't touch user A's rows.
4. `pnpm db:reset && pnpm db:test && pnpm db:types`

## Hosted Supabase

1. Create a project at supabase.com.
2. `pnpm exec supabase link --project-ref <ref>`, then `pnpm exec supabase db push` (applies migrations, **not** the seed).
3. **Authentication → URL Configuration:** set Site URL to your domain, and add `https://your-domain/**` to Redirect URLs.
4. Put the project URL and publishable key in your host's environment variables.
