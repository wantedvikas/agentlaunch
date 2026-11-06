import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { Readable } from "node:stream";

import { ALWAYS_REMOVE } from "./modules.mjs";

export const DEFAULT_REPO = "wantedvikas/agentlaunch";

/**
 * Copies the template into `dest`.
 * - A local path (starts with ".", "/" or "~") is copied, skipping heavy/private paths.
 * - Otherwise `owner/repo#ref` (default repo, ref = this CLI's release tag) is downloaded from
 *   GitHub. shortcut: integrity rests on GitHub + the release tag; pin by commit SHA
 *   (`--template owner/repo#<sha>`) or add checksum verification if tags may be moved.
 * @param {string} template
 * @param {string} dest
 */
export async function fetchTemplate(template, dest) {
  if (/^[./~]/.test(template)) {
    const src = resolve(template.replace(/^~/, process.env.HOME ?? "~"));
    const skip = new Set(ALWAYS_REMOVE.map((p) => resolve(src, p)));
    await cp(src, dest, {
      recursive: true,
      filter: (p) => !skip.has(resolve(p)) && basename(p) !== ".DS_Store",
    });
    return;
  }

  const [repo, ref] = template.split("#");
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !ref || !/^[\w./-]+$/.test(ref))
    throw new Error(`invalid --template "${template}" (expected owner/repo#ref or a local path)`);
  const url = `https://codeload.github.com/${repo}/tar.gz/${ref}`;
  const res = await fetch(url);
  if (!res.ok || !res.body)
    throw new Error(`download failed (HTTP ${res.status}) for ${repo}#${ref}`);

  await mkdir(dest, { recursive: true });
  await new Promise((ok, fail) => {
    // System tar (macOS, Linux, Windows 10+) avoids bundling an archive library.
    const tar = spawn("tar", ["-xz", "--strip-components=1", "-C", dest], {
      stdio: ["pipe", "ignore", "inherit"],
    });
    tar.on("error", fail);
    tar.on("close", (code) => (code === 0 ? ok(undefined) : fail(new Error(`tar exited ${code}`))));
    Readable.fromWeb(/** @type {any} */ (res.body)).pipe(tar.stdin);
  });
}

/**
 * Checks a release archive against the `<archive>.sha256` file shipped next to it.
 * Returns the hash, or null when there's no checksum file (the caller warns).
 * @param {string} archive
 */
export async function verifyChecksum(archive) {
  const sumFile = `${archive}.sha256`;
  if (!existsSync(sumFile)) return null;
  const expected = (await readFile(sumFile, "utf8")).trim().split(/\s+/)[0]?.toLowerCase();
  const actual = createHash("sha256")
    .update(await readFile(archive))
    .digest("hex");
  if (expected !== actual)
    throw new Error(
      `checksum mismatch for ${basename(archive)}: the download is corrupt or altered`,
    );
  return actual;
}

/**
 * Extracts a release archive (.tar.gz with one top-level folder) into `dest`.
 * System tar refuses absolute paths and `..` entries by default.
 * @param {string} archive
 * @param {string} dest
 */
export async function extractArchive(archive, dest) {
  await mkdir(dest, { recursive: true });
  const r = spawnSync("tar", ["-xzf", archive, "--strip-components=1", "-C", dest], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0)
    throw new Error(`couldn't extract ${basename(archive)} (expected a .tar.gz release)`);
}

/** The CLI arguments minus `--from <x>` / `--from=<x>`. @param {string[]} argv */
export function withoutFrom(argv) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from") i++;
    else if (!argv[i].startsWith("--from=")) out.push(argv[i]);
  }
  return out;
}
