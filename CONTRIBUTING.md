# Contributing

Thanks for helping improve AgentLaunch Community.

## Setup

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local
pnpm dev
```

Node 22+ is required (see `.nvmrc`).

## Before you open a pull request

```bash
pnpm format       # Prettier
pnpm check        # lint + typecheck + unit tests + build
pnpm test:e2e     # Playwright (installs nothing; run `pnpm exec playwright install chromium` once)
```

## Conventions

- **Follow existing patterns.** UI primitives live in `src/components/ui`, feature code in `src/features/<name>`, and app-wide config in `src/config/site.ts`.
- **Use design tokens.** Use semantic classes (`bg-primary`, `text-muted-foreground`) and never raw hex colors. Tokens live in `src/app/globals.css`.
- **Accessibility is required.** Every interactive element must be keyboard reachable with a visible focus ring. Use semantic HTML and label every input.
- **No new dependencies** without discussing them in an issue first.
- **Keep PRs small** and focused on one change.
- **No fake functionality.** A button either works or says clearly that it is a demo.

## Scope

See [docs/FEATURE_MATRIX.md](docs/FEATURE_MATRIX.md). Billing, email, blog and uploads belong to the commercial Pro edition and won't be accepted here.

By contributing, you agree your contribution is licensed under the MIT License, and you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
