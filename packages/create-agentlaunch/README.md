# create-agentlaunch

Create a new [AgentLaunch](https://github.com/wantedvikas/agentlaunch) app (Next.js 16 + Supabase SaaS starter) containing only the parts you choose.

```bash
npx create-agentlaunch@latest my-app
```

You'll be asked for:

| Question                                                   | Default                                    |
| ---------------------------------------------------------- | ------------------------------------------ |
| App name                                                   | from the directory name                    |
| Social sign-in (`google`, `github`, `azure`, `slack_oidc`) | none (email + password is always included) |
| Email (Resend/SMTP) + welcome email                        | yes                                        |
| Analytics (Plausible/GA) + cookie consent                  | yes                                        |
| Dockerfile                                                 | yes                                        |
| Install dependencies with pnpm                             | yes                                        |

Non-interactive (CI, scripts):

```bash
npx create-agentlaunch@latest my-app --yes --providers github,google --no-docker
```

Run `--help` for all flags.

## What it does

1. Downloads the template at the release tag matching this CLI's version (`wantedvikas/agentlaunch#v<version>`), or uses `--template owner/repo#ref` or a local path.
2. Removes the modules you didn't choose (files, marked code blocks, migrations, tests, dependencies) and the template repository's own files (changelog, CLI, contributor docs).
3. Renames the project (package name, app name, Supabase project id) and writes a project README.
4. Installs dependencies, formats the code and creates a git repository with an initial commit.

Every module combination is built and tested in CI (`.github/workflows/cli.yml`).

**Requires:** Node 22.18+, pnpm (`corepack enable pnpm`), `tar` (built into macOS, Linux and Windows 10+), and git (optional).

## How modules work (for template contributors)

Optional code in shared files sits between marker comments in that file's comment syntax:

```ts
// @module:email
import { sendWelcomeOnce } from "./welcome";
// @end:email
```

Whole files and folders, plus npm dependencies, are listed per module in `lib/modules.mjs`. The CLI refuses to finish if any marker is left over or unbalanced.

MIT licensed.
