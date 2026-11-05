import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";

import { isValidName, stripMarkers, titleCase, transformTemplate } from "../lib/transform.mjs";

const src = `a
// @module:email
email line
// @end:email
b
{/* @module:analytics */}
<Analytics />
{/* @end:analytics */}
c`;

describe("stripMarkers", () => {
  it("keeps enabled blocks without their markers", () => {
    assert.equal(
      stripMarkers(src, new Set(["email", "analytics"])),
      "a\nemail line\nb\n<Analytics />\nc",
    );
  });
  it("drops excluded blocks entirely", () => {
    assert.equal(stripMarkers(src, new Set(["analytics"])), "a\nb\n<Analytics />\nc");
    assert.equal(stripMarkers(src, new Set()), "a\nb\nc");
  });
  it("works with # and <!-- --> comment styles", () => {
    assert.equal(stripMarkers("x\n# @module:email\nE=1\n# @end:email\ny", new Set()), "x\ny");
    assert.equal(
      stripMarkers("x\n<!-- @module:email -->\nrow\n<!-- @end:email -->", new Set(["email"])),
      "x\nrow",
    );
  });
  it("collapses blank lines left behind", () => {
    assert.equal(stripMarkers("a\n\n// @module:email\nx\n// @end:email\n\nb", new Set()), "a\n\nb");
  });
  it("leaves files without markers untouched", () => {
    assert.equal(stripMarkers("a\n\n\n\nb", new Set()), "a\n\n\n\nb");
  });
  it("rejects unknown, unclosed, nested and stray markers", () => {
    assert.throws(() => stripMarkers("// @module:nope\n// @end:nope", new Set()), /unknown module/);
    assert.throws(() => stripMarkers("// @module:email\nx", new Set()), /never closed/);
    assert.throws(() => stripMarkers("// @module:email\n// @module:docker\n", new Set()), /nested/);
    assert.throws(() => stripMarkers("// @end:email", new Set()), /without matching/);
  });
});

describe("names", () => {
  it("validates package names", () => {
    assert.ok(isValidName("my-app"));
    assert.ok(!isValidName("My App"));
    assert.ok(!isValidName("../evil"));
    assert.ok(!isValidName(""));
  });
  it("title-cases slugs", () => assert.equal(titleCase("my-cool_app"), "My Cool App"));
});

describe("transformTemplate", async () => {
  const dir = await mkdtemp(join(tmpdir(), "cal-test-"));
  after(() => rm(dir, { recursive: true, force: true }));

  const files = {
    "package.json": JSON.stringify({
      name: "agentlaunch-community",
      version: "9.9.9",
      description: "x",
      license: "MIT",
      dependencies: { next: "1", nodemailer: "1" },
      devDependencies: { "@types/nodemailer": "1", vitest: "1" },
    }),
    LICENSE: "MIT License\n",
    "README.md": "template readme",
    ".env.example":
      "NEXT_PUBLIC_AUTH_PROVIDERS=\n# @module:email\nEMAIL_TRANSPORT=log\n# @end:email\n",
    "src/config/site.ts": 'export const siteConfig = {\n  name: "AgentLaunch",\n};\n',
    "supabase/config.toml": 'project_id = "agentlaunch-community"\n',
    "src/app/layout.tsx": "x\n// @module:analytics\nimport A from 'a';\n// @end:analytics\ny\n",
    "src/lib/email/index.ts": "export {}",
    "src/components/analytics/a.tsx": "export {}",
    Dockerfile: "FROM node",
    "packages/create-agentlaunch/index.mjs": "",
    "docs/CHANGELOG.md": "",
    "docs/screenshots/a.png": "",
  };
  for (const [p, body] of Object.entries(files)) {
    await mkdir(dirname(join(dir, p)), { recursive: true });
    await writeFile(join(dir, p), body);
  }

  await transformTemplate(dir, {
    name: "acme",
    appName: "Acme Cloud",
    modules: ["analytics"],
    providers: ["github", "google"],
  });
  const read = (p) => readFile(join(dir, p), "utf8");

  it("removes excluded modules and template-only files, keeps included ones", () => {
    for (const p of [
      "src/lib/email",
      "Dockerfile",
      "packages",
      "docs/CHANGELOG.md",
      "docs/screenshots",
      "LICENSE",
    ])
      assert.ok(!existsSync(join(dir, p)), `${p} should be gone`);
    assert.ok(existsSync(join(dir, "src/components/analytics/a.tsx")));
    assert.ok(existsSync(join(dir, "licenses/agentlaunch-MIT.txt")));
  });
  it("strips markers in shared files", async () => {
    assert.equal(await read("src/app/layout.tsx"), "x\nimport A from 'a';\ny\n");
    assert.equal(await read(".env.example"), "NEXT_PUBLIC_AUTH_PROVIDERS=github,google\n");
  });
  it("renames the project and drops excluded dependencies", async () => {
    const pkg = JSON.parse(await read("package.json"));
    assert.equal(pkg.name, "acme");
    assert.equal(pkg.version, "0.1.0");
    assert.equal(pkg.license, undefined);
    assert.deepEqual(pkg.dependencies, { next: "1" });
    assert.deepEqual(pkg.devDependencies, { vitest: "1" });
    assert.match(await read("src/config/site.ts"), /name: "Acme Cloud",/);
    assert.equal(await read("supabase/config.toml"), 'project_id = "acme"\n');
  });
  it("writes a project README listing only chosen features", async () => {
    const readme = await read("README.md");
    assert.match(readme, /^# Acme Cloud/);
    assert.match(readme, /github, google/);
    assert.match(readme, /Plausible/);
    assert.doesNotMatch(readme, /Dockerfile|Resend/);
  });
});
