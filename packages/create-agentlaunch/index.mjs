#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { MODULE_IDS, MODULES, OAUTH_PROVIDERS } from "./lib/modules.mjs";
import { DEFAULT_REPO, fetchTemplate } from "./lib/source.mjs";
import { isValidName, titleCase, transformTemplate } from "./lib/transform.mjs";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const HELP = `create-agentlaunch ${version}

Usage: npx create-agentlaunch [directory] [options]

Options:
  --app-name <name>       Display name (default: from the directory name)
  --providers <list>      Social sign-in: ${OAUTH_PROVIDERS.join(",")} (comma-separated)
  --no-email              Leave out app email + welcome email
  --no-analytics          Leave out analytics + cookie consent
  --no-docker             Leave out the Dockerfile
  --no-install            Don't run pnpm install
  --no-git                Don't create a git repository
  --template <src>        owner/repo#ref or a local path (default: ${DEFAULT_REPO}#v${version})
  -y, --yes               Accept defaults; never prompt
  -h, --help              Show this help
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "app-name": { type: "string" },
      providers: { type: "string" },
      "no-email": { type: "boolean" },
      "no-analytics": { type: "boolean" },
      "no-docker": { type: "boolean" },
      "no-install": { type: "boolean" },
      "no-git": { type: "boolean" },
      template: { type: "string" },
      yes: { type: "boolean", short: "y" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) return console.log(HELP);

  const interactive = !values.yes && process.stdin.isTTY;
  if (!values.yes && !process.stdin.isTTY)
    throw new Error("not a terminal; pass --yes and flags to run non-interactively (see --help)");
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  const ask = async (q, def) => (rl ? (await rl.question(`${q} (${def}) `)).trim() || def : def);
  const yesNo = async (q, def) => {
    if (!rl) return def;
    const a = (await rl.question(`${q} (${def ? "Y/n" : "y/N"}) `)).trim().toLowerCase();
    return a ? a.startsWith("y") : def;
  };

  try {
    const dirArg = positionals[0] ?? (await ask("Project directory?", "my-app"));
    const target = resolve(dirArg);
    const name = basename(target).toLowerCase();
    if (!isValidName(name))
      throw new Error(`"${name}" isn't a valid package name (lowercase letters, digits, . _ -)`);
    if (existsSync(target) && readdirSync(target).length)
      throw new Error(`${target} already exists and isn't empty`);

    const appName = values["app-name"] ?? (await ask("App name?", titleCase(name)));

    const providerInput =
      values.providers ??
      (await ask(`Social sign-in providers? [${OAUTH_PROVIDERS.join(",")}] or none`, "none"));
    const providers =
      providerInput === "none"
        ? []
        : providerInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    const unknown = providers.filter((p) => !OAUTH_PROVIDERS.includes(p));
    if (unknown.length) throw new Error(`unknown provider(s): ${unknown.join(", ")}`);

    const modules = [];
    for (const id of MODULE_IDS) {
      if (values[`no-${id}`]) continue;
      if (await yesNo(`Include ${MODULES[id].label}?`, true)) modules.push(id);
    }
    const install = !values["no-install"] && (await yesNo("Install dependencies with pnpm?", true));
    rl?.close();

    const template = values.template ?? `${DEFAULT_REPO}#v${version}`;
    console.log(`\nCreating ${appName} in ${target}`);
    console.log(`  template: ${template}`);
    console.log(`  modules:  ${modules.join(", ") || "core only"}`);
    console.log(`  sign-in:  email${providers.length ? ", " + providers.join(", ") : ""}\n`);

    try {
      await fetchTemplate(template, target);
      await transformTemplate(target, { name, appName, modules, providers });
    } catch (err) {
      await rm(target, { recursive: true, force: true }); // don't leave a half-made project
      throw err;
    }

    const run = (cmd, args) =>
      spawnSync(cmd, args, { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
    if (install) {
      if (run("pnpm", ["install"]).status !== 0)
        console.warn("! pnpm install failed; run it yourself.");
      else run("pnpm", ["format"]);
    }
    if (!values["no-git"] && spawnSync("git", ["--version"]).status === 0) {
      run("git", ["init", "-q", "-b", "main"]);
      run("git", ["add", "-A"]);
      const commit = spawnSync(
        "git",
        ["commit", "-q", "-m", "Initial commit from create-agentlaunch"],
        { cwd: target },
      );
      if (commit.status !== 0)
        console.log("! Created a git repo but didn't commit (set git user.name/user.email).");
    }

    console.log(`\nDone. Next steps:\n
  cd ${dirArg}${install ? "" : "\n  pnpm install"}
  cp .env.example .env.local
  pnpm db:start                 # needs Docker
  pnpm exec supabase status     # copy API URL + Publishable key into .env.local
  pnpm run doctor
  pnpm dev\n`);
    if (providers.length)
      console.log(
        `Social sign-in (${providers.join(", ")}): create OAuth apps first, see docs/AUTH_SETUP.md.\n`,
      );
  } finally {
    rl?.close();
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
