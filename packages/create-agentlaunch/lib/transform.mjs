import { existsSync } from "node:fs";
import { readdir, readFile, rename, mkdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { ALWAYS_REMOVE, MODULES, MODULE_IDS } from "./modules.mjs";

const MARKER = /@(module|end):([a-z0-9_-]+)/;
const TEXT_EXT =
  /\.(m?[jt]sx?|json|md|mdc|css|sql|toml|ya?ml|txt|example)$|^(Dockerfile|\.env\.example|\.gitignore)$/;

/**
 * Removes marked blocks for excluded modules and marker lines for included ones.
 * Throws on unbalanced or nested markers so a broken template fails loudly.
 * @param {string} text
 * @param {Set<string>} enabled
 * @param {string} [file] for error messages
 */
export function stripMarkers(text, enabled, file = "<text>") {
  if (!text.includes("@module:") && !text.includes("@end:")) return text;
  const out = [];
  /** @type {string | null} */
  let open = null;
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const m = line.match(MARKER);
    if (m) {
      const [, kind, id] = m;
      if (!(id in MODULES)) throw new Error(`${file}:${i + 1}: unknown module "${id}"`);
      if (kind === "module") {
        if (open) throw new Error(`${file}:${i + 1}: nested @module:${id} inside @module:${open}`);
        open = id;
      } else {
        if (open !== id) throw new Error(`${file}:${i + 1}: @end:${id} without matching @module`);
        open = null;
      }
      return; // marker lines never survive
    }
    if (open && !enabled.has(open)) return;
    out.push(line);
  });
  if (open) throw new Error(`${file}: @module:${open} is never closed`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

async function walk(dir, root = dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, root)));
    else files.push(relative(root, full));
  }
  return files;
}

/** Display name for a project slug: "my-cool-app" → "My Cool App". */
export function titleCase(slug) {
  return slug
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** npm-compatible package name (unscoped). */
export function isValidName(name) {
  return /^[a-z0-9][a-z0-9._-]*$/.test(name) && name.length <= 214;
}

/**
 * Turns a freshly copied template directory into the user's project, in place.
 * @param {string} dir
 * @param {{ name: string, appName: string, modules: string[], providers: string[] }} opts
 */
export async function transformTemplate(dir, { name, appName, modules, providers }) {
  const enabled = new Set(modules);
  const excluded = MODULE_IDS.filter((id) => !enabled.has(id));

  for (const p of ALWAYS_REMOVE) await rm(join(dir, p), { recursive: true, force: true });
  for (const id of excluded)
    for (const p of MODULES[id].paths) await rm(join(dir, p), { recursive: true, force: true });

  for (const file of await walk(dir)) {
    const base = file.split("/").pop() ?? file;
    if (!TEXT_EXT.test(base)) continue;
    const full = join(dir, file);
    const text = await readFile(full, "utf8");
    const next = stripMarkers(text, enabled, file);
    if (next !== text) await writeFile(full, next);
  }

  // Keep the MIT notice for the template code without making the user's app MIT-licensed.
  if (existsSync(join(dir, "LICENSE"))) {
    await mkdir(join(dir, "licenses"), { recursive: true });
    await rename(join(dir, "LICENSE"), join(dir, "licenses", "agentlaunch-MIT.txt"));
  }

  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = name;
  pkg.version = "0.1.0";
  delete pkg.description;
  delete pkg.license;
  for (const id of excluded) {
    for (const d of MODULES[id].dependencies) delete pkg.dependencies?.[d];
    for (const d of MODULES[id].devDependencies) delete pkg.devDependencies?.[d];
  }
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  await replaceIn(
    join(dir, "src/config/site.ts"),
    /name: "AgentLaunch",/,
    `name: ${JSON.stringify(appName)},`,
  );
  // A unique project_id keeps this app's local Supabase containers apart from other projects.
  await replaceIn(
    join(dir, "supabase/config.toml"),
    /^project_id = ".*"$/m,
    `project_id = ${JSON.stringify(name)}`,
  );
  await replaceIn(
    join(dir, ".env.example"),
    /^NEXT_PUBLIC_AUTH_PROVIDERS=.*$/m,
    `NEXT_PUBLIC_AUTH_PROVIDERS=${providers.join(",")}`,
  );

  await writeFile(
    join(dir, "README.md"),
    projectReadme({ appName, modules: [...enabled], providers }),
  );

  const leftover = [];
  for (const file of await walk(dir)) {
    const base = file.split("/").pop() ?? file;
    if (TEXT_EXT.test(base) && MARKER.test(await readFile(join(dir, file), "utf8")))
      leftover.push(file);
  }
  if (leftover.length) throw new Error(`module markers left in: ${leftover.join(", ")}`);
}

async function replaceIn(file, pattern, replacement) {
  if (!existsSync(file)) return;
  const text = await readFile(file, "utf8");
  if (!pattern.test(text)) throw new Error(`template changed: ${pattern} not found in ${file}`);
  await writeFile(file, text.replace(pattern, replacement));
}

export function projectReadme({ appName, modules, providers }) {
  const has = (id) => modules.includes(id);
  return `# ${appName}

Built with [AgentLaunch](https://github.com/wantedvikas/agentlaunch): Next.js 16, Supabase and TypeScript.

## Quickstart

Requires Node 22.18+ and Docker (for local Supabase).

\`\`\`bash
corepack enable pnpm
pnpm install
cp .env.example .env.local
pnpm db:start                     # local Supabase in Docker
pnpm exec supabase status         # copy API URL + Publishable key into .env.local
pnpm run doctor                   # checks your setup; never prints secrets
pnpm dev                          # http://localhost:3000
\`\`\`

Local emails (sign-up confirmation, password reset) appear in Mailpit at http://127.0.0.1:54324.
Local demo login: \`demo@agentlaunch.local\` / \`demo-password-123\` (seeded locally only).

## What's included

- Email/password auth with confirmation and password reset${providers.length ? `, plus sign-in with ${providers.join(", ")} (configure each one: docs/AUTH_SETUP.md)` : ""}
- Per-user data protected by row-level security, with SQL tests (\`pnpm db:test\`)
- Dashboard, example projects CRUD, profile settings, light/dark themes${has("email") ? "\n- App email through Resend or SMTP, with a welcome email (docs/EMAIL_AND_ANALYTICS.md)" : ""}${has("analytics") ? "\n- Plausible or Google Analytics with a cookie-consent banner (docs/EMAIL_AND_ANALYTICS.md)" : ""}${has("blog") ? "\n- MDX blog: add posts as .mdx files in src/content/blog" : ""}${has("uploads") ? "\n- Private per-user file uploads in Supabase Storage, with storage policies and tests" : ""}${has("ai") ? "\n- AI assistant example calling Claude from the server (docs/AI.md)" : ""}${has("payments") ? "\n- Stripe subscription billing: Checkout, Customer Portal, a verified webhook and a paid-only page (docs/BILLING.md)" : ""}${has("admin") ? "\n- Basic admin area: users list and hourly stats. Local admin: \`admin@agentlaunch.local\` / \`admin-password-123\`" : ""}${has("docker") ? "\n- A production Dockerfile (docs/DEPLOY.md)" : ""}

## Commands

| Command | What it does |
| --- | --- |
| \`pnpm dev\` | Dev server |
| \`pnpm run doctor\` | Setup check |
| \`pnpm check\` | Lint + typecheck + unit tests + build |
| \`pnpm test:e2e\` | Browser tests (needs \`pnpm db:start\`) |
| \`pnpm db:reset\` / \`db:test\` / \`db:types\` | Reset local DB, run RLS tests, regenerate types |

## Working with AI coding agents

Point your agent at [AGENTS.md](AGENTS.md): the rules and step-by-step recipes for this codebase.

## Docs

[Local Supabase](docs/LOCAL_SUPABASE.md) · [Auth](docs/AUTH_SETUP.md) · [Deploy](docs/DEPLOY.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [Security checklist](docs/SECURITY_CHECKLIST.md)

AgentLaunch template code is MIT-licensed; its notice is in \`licenses/agentlaunch-MIT.txt\`.
`;
}
