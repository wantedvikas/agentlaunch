---
name: add-rls-table
description: Add a new Supabase table owned by a user, with least-privilege grants, row-level security and pgTAP tests. Use when the task needs to store new per-user data.
---

Follow **AGENTS.md → Recipe 1: Add an RLS-protected table** exactly. Done means:

- [ ] A migration created with `pnpm exec supabase migration new <name>`, never by editing an applied migration
- [ ] `revoke all … from anon, authenticated`, column-level insert/update grants that exclude `owner_id`
- [ ] RLS enabled and four owner policies using `(select auth.uid())`
- [ ] A pgTAP file in `supabase/tests/` covering owner CRUD, cross-user denial and anon `42501`
- [ ] `pnpm db:reset && pnpm db:test && pnpm db:types` all succeed
- [ ] `LATEST_MIGRATION_PROBE` in `scripts/doctor.mts` updated if this is the newest migration
