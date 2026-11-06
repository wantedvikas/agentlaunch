import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { createHash } from "node:crypto";

import { extractArchive, verifyChecksum, withoutFrom } from "../lib/source.mjs";

const work = await mkdtemp(join(tmpdir(), "cli-source-test-"));
after(() => rm(work, { recursive: true, force: true }));

// A tiny release: one top-level folder, like scripts/release.mts produces.
await mkdir(join(work, "src", "pro-1.0.0", "packages"), { recursive: true });
await writeFile(join(work, "src", "pro-1.0.0", "README.md"), "hello");
const archive = join(work, "pro-1.0.0.tar.gz");
assert.equal(spawnSync("tar", ["-czf", archive, "-C", join(work, "src"), "pro-1.0.0"]).status, 0);
const sha = createHash("sha256")
  .update(await readFile(archive))
  .digest("hex");

describe("verifyChecksum", () => {
  it("returns null when there is no .sha256 file", async () => {
    assert.equal(await verifyChecksum(archive), null);
  });
  it("accepts a matching checksum (sha256sum format)", async () => {
    await writeFile(`${archive}.sha256`, `${sha}  pro-1.0.0.tar.gz\n`);
    assert.equal(await verifyChecksum(archive), sha);
  });
  it("rejects a mismatch", async () => {
    await writeFile(`${archive}.sha256`, `${"0".repeat(64)}  pro-1.0.0.tar.gz\n`);
    await assert.rejects(verifyChecksum(archive), /checksum mismatch/);
    await rm(`${archive}.sha256`);
  });
});

describe("extractArchive", () => {
  it("unpacks the top-level folder's contents", async () => {
    const dest = join(work, "out");
    await extractArchive(archive, dest);
    assert.equal(await readFile(join(dest, "README.md"), "utf8"), "hello");
    assert.ok(existsSync(join(dest, "packages")));
  });
  it("fails clearly on something that isn't a .tar.gz", async () => {
    const bad = join(work, "bad.tar.gz");
    await writeFile(bad, "not an archive");
    await assert.rejects(extractArchive(bad, join(work, "bad")), /couldn't extract/);
  });
});

describe("withoutFrom", () => {
  it("drops --from and its value in both forms, keeping everything else", () => {
    assert.deepEqual(withoutFrom(["app", "--from", "x.tar.gz", "--yes"]), ["app", "--yes"]);
    assert.deepEqual(withoutFrom(["--from=x.tar.gz", "app", "--no-ai"]), ["app", "--no-ai"]);
  });
});
