/**
 * pnpm doctor — read-only setup check.
 * Prints variable NAMES and check results only, never values. Writes nothing.
 * Runs on Node 22.18+ via built-in TypeScript type stripping (no build step, no dependencies).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export type Status = "ok" | "warn" | "fail";
export type Check = { status: Status; name: string; detail: string };
type Env = Record<string, string | undefined>;
type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const PROVIDERS = ["google", "github", "azure", "slack_oidc"];
// Newest migration's objects; update when you add a migration so doctor detects stale databases.
const LATEST_MIGRATION_PROBE = { kind: "rpc", name: "claim_welcome_email" } as const;

const ok = (name: string, detail: string): Check => ({ status: "ok", name, detail });
const warn = (name: string, detail: string): Check => ({ status: "warn", name, detail });
const fail = (name: string, detail: string): Check => ({ status: "fail", name, detail });

function isHttpUrl(v: string | undefined) {
  try {
    const u = new URL(v ?? "");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** True if a value looks like a key that must never be public (secret / service_role). */
export function looksSecret(v: string | undefined) {
  if (!v) return false;
  if (v.startsWith("sb_secret_")) return true;
  const payload = v.split(".")[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).role === "service_role";
  } catch {
    return false;
  }
}

export function checkToolchain(
  nodeVersion: string,
  pnpmVersion: string | null,
  wantedPnpm: string | null,
): Check[] {
  const [major = 0, minor = 0] = nodeVersion.replace(/^v/, "").split(".").map(Number);
  const out = [
    major > 22 || (major === 22 && minor >= 18)
      ? ok("Node.js", nodeVersion)
      : fail("Node.js", `${nodeVersion} found; 22.18 or newer required (see .nvmrc)`),
  ];
  if (!pnpmVersion) out.push(fail("pnpm", "not found; run `corepack enable pnpm`"));
  else if (wantedPnpm && pnpmVersion.split(".")[0] !== wantedPnpm.split(".")[0])
    out.push(warn("pnpm", `${pnpmVersion} found; package.json pins ${wantedPnpm}`));
  else out.push(ok("pnpm", pnpmVersion));
  return out;
}

export function checkEnv(env: Env, hasEnvFile: boolean): Check[] {
  const out: Check[] = [
    hasEnvFile
      ? ok(".env.local", "found")
      : warn(".env.local", "not found; copy .env.example (using process env only)"),
  ];
  out.push(
    isHttpUrl(env.NEXT_PUBLIC_SITE_URL)
      ? ok("NEXT_PUBLIC_SITE_URL", "valid URL")
      : fail(
          "NEXT_PUBLIC_SITE_URL",
          "missing or not an http(s) URL; auth email links depend on it",
        ),
  );
  out.push(
    isHttpUrl(env.NEXT_PUBLIC_SUPABASE_URL)
      ? ok("NEXT_PUBLIC_SUPABASE_URL", "valid URL")
      : fail("NEXT_PUBLIC_SUPABASE_URL", "missing or not an http(s) URL"),
  );
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) out.push(fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "missing"));
  else if (looksSecret(key))
    out.push(
      fail(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "this is a SECRET/service_role key; it would be sent to every browser. Use the publishable (or anon) key and rotate the secret key",
      ),
    );
  else out.push(ok("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "set"));

  for (const [name, value] of Object.entries(env)) {
    if (
      name.startsWith("NEXT_PUBLIC_") &&
      name !== "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" &&
      looksSecret(value)
    )
      out.push(fail(name, "contains a secret key; NEXT_PUBLIC_ values are public"));
  }

  const unknown = (env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !PROVIDERS.includes(s));
  if (unknown.length)
    out.push(warn("NEXT_PUBLIC_AUTH_PROVIDERS", `ignored unknown ids: ${unknown.join(", ")}`));

  const transport = env.EMAIL_TRANSPORT || "log";
  if (transport === "log")
    out.push(warn("EMAIL_TRANSPORT", "log (emails are not sent; fine for local dev)"));
  else if (transport === "resend")
    out.push(
      env.RESEND_API_KEY && env.EMAIL_FROM
        ? ok("EMAIL_TRANSPORT", "resend configured")
        : fail("EMAIL_TRANSPORT", "resend needs RESEND_API_KEY and EMAIL_FROM"),
    );
  else if (transport === "smtp")
    out.push(
      env.SMTP_HOST && env.EMAIL_FROM
        ? ok("EMAIL_TRANSPORT", "smtp configured")
        : fail("EMAIL_TRANSPORT", "smtp needs SMTP_HOST and EMAIL_FROM"),
    );
  else out.push(fail("EMAIL_TRANSPORT", "must be resend, smtp or log"));

  const ga = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (ga && !/^G-[A-Z0-9]{4,20}$/.test(ga))
    out.push(
      fail("NEXT_PUBLIC_GA_MEASUREMENT_ID", "not a GA4 id (G-XXXXXXX); analytics stays off"),
    );
  const pl = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (pl && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(pl))
    out.push(fail("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", "not a hostname; analytics stays off"));
  return out;
}

export async function checkSupabase(env: Env, fetchFn: Fetch): Promise<Check[]> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!isHttpUrl(url) || !key || looksSecret(key))
    return [warn("Supabase", "skipped (fix the variables above first)")];
  const base = url!.replace(/\/$/, "");
  const headers = { apikey: key, "Content-Type": "application/json" };
  const out: Check[] = [];

  try {
    const health = await fetchFn(`${base}/auth/v1/health`, { headers });
    if (!health.ok)
      return [fail("Supabase reachable", `auth health returned HTTP ${health.status}`)];
    out.push(ok("Supabase reachable", "auth is healthy"));
  } catch {
    return [
      fail(
        "Supabase reachable",
        "no response; is `pnpm db:start` running (or the hosted URL right)?",
      ),
    ];
  }

  // Anonymous callers are denied (401/42501) on existing objects, and get 404 for missing ones.
  // That tells us whether migrations ran without reading or writing any data.
  const tables = await fetchFn(`${base}/rest/v1/projects?select=id&limit=1`, { headers });
  const latest = await fetchFn(`${base}/rest/v1/rpc/${LATEST_MIGRATION_PROBE.name}`, {
    method: "POST",
    headers,
    body: "{}",
  });
  if (tables.status === 404)
    out.push(
      fail(
        "Migrations",
        "tables missing; run `pnpm db:reset` (local) or `supabase db push` (hosted)",
      ),
    );
  else if (latest.status === 404)
    out.push(fail("Migrations", "database is behind; apply the newest migrations"));
  else if (tables.status === 200)
    out.push(
      fail("Row-level security", "anonymous users can read `projects`; grants/RLS are wrong"),
    );
  else out.push(ok("Migrations", "applied, and anonymous access is denied"));

  const wanted = (env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => PROVIDERS.includes(s));
  if (wanted.length) {
    try {
      const settings = (await (await fetchFn(`${base}/auth/v1/settings`, { headers })).json()) as {
        external?: Record<string, boolean>;
      };
      for (const p of wanted)
        out.push(
          settings.external?.[p]
            ? ok(`Sign-in: ${p}`, "enabled in Supabase")
            : fail(
                `Sign-in: ${p}`,
                "listed in NEXT_PUBLIC_AUTH_PROVIDERS but disabled in Supabase; the button would fail",
              ),
        );
    } catch {
      out.push(warn("Sign-in providers", "couldn't read Supabase auth settings"));
    }
  }
  return out;
}

async function main() {
  for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f); // never overrides real env
  let pnpm: string | null = null;
  try {
    pnpm = execFileSync("pnpm", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {}
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { packageManager?: string };

  const checks = [
    ...checkToolchain(process.version, pnpm, pkg.packageManager?.split("@")[1] ?? null),
    ...checkEnv(process.env, existsSync(".env.local")),
    ...(await checkSupabase(process.env, fetch)),
  ];
  const icon = { ok: "✓", warn: "!", fail: "✗" };
  for (const c of checks) console.log(`${icon[c.status]} ${c.name.padEnd(38)} ${c.detail}`);
  const failed = checks.filter((c) => c.status === "fail").length;
  console.log(
    failed
      ? `\n${failed} problem(s) found. See docs/TROUBLESHOOTING.md.`
      : "\nAll required checks passed.",
  );
  process.exitCode = failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) void main();
