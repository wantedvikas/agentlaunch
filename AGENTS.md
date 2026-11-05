<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent guide: AgentLaunch Community

Instructions for AI coding agents (Claude Code, Cursor, Codex, …) and humans. `CLAUDE.md` imports this file; `.cursor/rules/` and `.claude/skills/` point back here. **This file is the source of truth.**

## Map

| Path                                         | What lives there                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/app/(marketing)` `(auth)` `(dashboard)` | Routes. Pages stay thin: they compose feature components inside `<Suspense>`                 |
| `src/features/<name>/`                       | `schema.ts` (Zod), `queries.ts` (server reads), `actions.ts` (Server Actions), `components/` |
| `src/features/projects/`                     | **Reference feature.** Copy its shape                                                        |
| `src/components/ui/`                         | Design-system primitives (Radix-based). Reuse; don't fork                                    |
| `src/lib/permissions/auth.ts`                | `requireUser()` / `getCurrentUser()`: server-side identity                                   |
| `src/lib/supabase/`                          | Server client, proxy session refresh, generated `database.types.ts`                          |
| `src/lib/email/`                             | `sendEmail()` (Resend/SMTP/log) and templates                                                |
| `src/config/site.ts`                         | App name, nav, links                                                                         |
| `src/app/globals.css`                        | Design tokens (light + dark)                                                                 |
| `supabase/migrations/` · `supabase/tests/`   | Schema, grants, RLS · pgTAP authorization tests                                              |
| `scripts/doctor.mts`                         | `pnpm run doctor` read-only setup check                                                      |

## Rules

1. **Run the checks before you say you're done:** `pnpm check` always; `pnpm db:test` if you touched SQL; `pnpm test:e2e` if you touched pages. Never claim a check passed if you didn't run it.
2. **Follow existing patterns; don't invent new ones.** Copy `src/features/projects`.
3. **No new dependencies** unless the human approves them.
4. **Design tokens only.** Use semantic classes (`bg-card`, `text-muted-foreground`, `border-border`), never raw colors.
5. **Accessibility:** semantic elements, `FormField` for every input, visible focus, Radix primitives for anything interactive.
6. **Validate with Zod** in `schema.ts`. Server Actions re-validate; client validation is only for UX.
7. **No fake functionality.** If something can't work yet (missing config), the UI says so.
8. **Secrets:** never commit `.env*` (except `.env.example`), never put secrets in `NEXT_PUBLIC_*`, never log secrets, emails or message bodies.
9. **Keep changes scoped.** No unrelated refactors or reformatting.
10. **Authorize on the server, every time.** Every query and action calls `requireUser()` / `getCurrentUser()` and filters by `owner_id`. RLS is the backstop. The proxy redirect is UX, not security.
11. **Schema changes only through migrations.** Every new table: `revoke all`, minimal grants, `enable row level security`, owner policies, a pgTAP test. Then `pnpm db:types`.
12. **Never use the Supabase secret / service_role key** in this app, and never bypass RLS.
13. **Forms** use `method="post"` plus React Hook Form, so a submit before hydration can't leak values into the URL.
14. **Request-time data** (anything reading the session) goes inside `<Suspense>`; see Next.js notes below.

## Recipe 1: Add an RLS-protected table

Example: `notes` owned by a user.

1. `pnpm exec supabase migration new notes` → edit the new file in `supabase/migrations/`:
   ```sql
   create table public.notes (
     id uuid primary key default gen_random_uuid(),
     owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
     body text not null check (char_length(body) between 1 and 2000),
     created_at timestamptz not null default now()
   );
   create index notes_owner_id_idx on public.notes (owner_id, created_at desc);

   revoke all on table public.notes from anon, authenticated;
   grant select, delete on table public.notes to authenticated;
   grant insert (body), update (body) on table public.notes to authenticated; -- never owner_id

   alter table public.notes enable row level security;
   create policy "Notes: owner can read"   on public.notes for select to authenticated using (owner_id = (select auth.uid()));
   create policy "Notes: owner can create" on public.notes for insert to authenticated with check (owner_id = (select auth.uid()));
   create policy "Notes: owner can update" on public.notes for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
   create policy "Notes: owner can delete" on public.notes for delete to authenticated using (owner_id = (select auth.uid()));
   ```
2. Add `supabase/tests/notes.test.sql`, copying `rls_profiles_projects.test.sql`. At minimum: owner can CRUD; user B can't read, update or delete A's rows (verify as table owner afterwards); B can't insert with A's `owner_id`; anon gets `42501`.
3. `pnpm db:reset && pnpm db:test && pnpm db:types`
4. If it's the newest migration, update `LATEST_MIGRATION_PROBE` in `scripts/doctor.mts` so doctor detects stale databases.

## Recipe 2: Add a CRUD feature page

Example: notes UI on top of Recipe 1.

1. `src/features/notes/schema.ts`: a Zod input schema (trim strings, match the DB length limits).
2. `src/features/notes/queries.ts`: start with `import "server-only"`; `requireUser("/dashboard/notes")`; select explicit columns with `.eq("owner_id", user.id)`; throw a generic error on failure.
3. `src/features/notes/actions.ts`: `"use server"`; for each action, `getCurrentUser()` (return a "session ended" error if null) → `schema.safeParse` → validate ids with `z.uuid()` → Supabase call with `.eq("owner_id", user.id)` and `.select("id")` → treat 0 rows as "not found" → `revalidatePath("/dashboard", "layout")`. Return `ActionResult` and log only `error.code`.
4. `src/features/notes/components/`: copy `project-form-dialog.tsx`, `projects-table.tsx`, `delete-project-button.tsx`. Keep `method="post"`, `FormField`, `toast`, and the loading states.
5. `src/app/(dashboard)/dashboard/notes/page.tsx`: static `PageHeader` + `<Suspense fallback={<Skeleton …/>}>` around an async component that calls `listNotes()`; `EmptyState` when there are no rows.
6. Nav: add `{ title: "Notes", href: "/dashboard/notes", icon: "notes" }` to `siteConfig.dashboardNav`, and map the icon in `src/components/dashboard/dashboard-nav.tsx`.
7. Tests: unit-test the schema; extend `tests/e2e/auth.spec.ts` with create → edit → delete, plus a second user who can't see the row.
8. `pnpm check && pnpm db:test && pnpm test:e2e`

## Recipe 3: Extend the design tokens

1. In `src/app/globals.css`, add the variable to **both** `:root` and `.dark`, e.g. `--info: oklch(0.55 0.12 240);` and a dark-mode value.
2. Expose it to Tailwind in `@theme inline`: `--color-info: var(--info);`. Classes like `bg-info` and `text-info` now work.
3. Check contrast for text on the new color in both themes (aim for 4.5:1), then use it through components (e.g. add an `info` variant in `badge.tsx` with `cva`), not ad-hoc classes.
4. `pnpm test:e2e` (includes the axe accessibility check) and look at both themes.

## Recipe 4: Add an email

See `docs/EMAIL_AND_ANALYTICS.md` → "Add a new email". Server code only; escape user values in HTML.

## Next.js 16 specifics in this repo

- `cacheComponents` is on. Request-time APIs (`cookies()`, `headers()`, `searchParams`) must sit inside `<Suspense>`. The Supabase server client calls `connection()` so session reads are always request-time.
- Next 16 keeps previous routes mounted but hidden (React Activity). In Playwright, prefer `getByRole` or `.filter({ visible: true })` over `getByLabel`.
- `PageProps<"/route">` / `LayoutProps<"/route">` come from `next typegen` (run by `pnpm typecheck`).
- Read the guides in `node_modules/next/dist/docs/` before using an unfamiliar API.
- `pnpm doctor` is pnpm's own built-in command. **Our setup check is `pnpm run doctor`.**
