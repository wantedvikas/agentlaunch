<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent guide: AgentLaunch Community

> Early version (milestone C1). Full recipes arrive in C3: add a CRUD page, add an RLS table, extend tokens.

## Rules

1. **Run `pnpm check` before you say you're done.** Run `pnpm test:e2e` too if you touched pages. Never claim a check passed if you didn't run it.
2. **Follow existing patterns; don't invent new ones.** UI goes in `src/components/ui`, feature code in `src/features/<name>/` (`schema.ts`, `components/`), and routes in `src/app/(group)/`.
3. **No new dependencies** unless the human approves them.
4. **Design tokens only.** Use semantic Tailwind classes (`bg-card`, `text-muted-foreground`, `border-border`). Add new tokens to both `:root` and `.dark` in `src/app/globals.css`.
5. **Accessibility:** use semantic elements, label every input with `FormField`, keep visible focus, and use Radix primitives for anything interactive.
6. **Validate with Zod** in `features/*/schema.ts`. The server must re-validate. Client validation is only for UX.
7. **No fake functionality.** If something can't work yet, the UI must say so.
8. **Secrets:** never commit `.env*` files except `.env.example`. Never put secrets in `NEXT_PUBLIC_*` variables. Never log secret values.
9. **Keep changes scoped.** No unrelated refactors or reformatting.

## Next.js 16 specifics in this repo

- `cacheComponents` is on. Request-time APIs (`cookies()`, `headers()`) need a `<Suspense>` boundary. Read `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md` before adding auth.
- Typed `LayoutProps<"/route">` / `PageProps<"/route">` come from `next typegen` (run by `pnpm typecheck`).
