---
name: add-crud-feature
description: Add a dashboard page with create/edit/delete for a user-owned resource, copying the projects reference feature. Use for any new per-user list/detail/CRUD screen.
---

1. If the table doesn't exist yet, use the `add-rls-table` skill first.
2. Follow **AGENTS.md → Recipe 2: Add a CRUD feature page**, copying `src/features/projects/`.

Non-negotiables (see AGENTS.md rules 10, 13, 14):

- Every query and action authorizes with `requireUser()` / `getCurrentUser()` **and** filters by `owner_id`
- The server re-validates with the Zod schema; ids are validated with `z.uuid()`
- Forms use `method="post"`; session-reading UI sits inside `<Suspense>`
- Empty, loading and error states are present; no fake data

Finish with `pnpm check && pnpm db:test && pnpm test:e2e` and report the real results.
