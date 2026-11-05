/**
 * Optional modules. Each one owns whole paths plus marked blocks in shared files:
 *   <comment> @module:<id>   ...lines...   <comment> @end:<id>
 * When a module is excluded its paths and marked blocks are removed; otherwise only the
 * marker lines are. Keep this list in sync with the markers in the template.
 */
export const MODULES = {
  email: {
    label: "Email (Resend or SMTP) + welcome email",
    paths: [
      "src/lib/email",
      "src/features/auth/welcome.ts",
      "supabase/migrations/20261105000000_welcome_email.sql",
      "supabase/tests/welcome_email.test.sql",
      "tests/unit/email.test.ts",
    ],
    dependencies: ["nodemailer"],
    devDependencies: ["@types/nodemailer"],
  },
  analytics: {
    label: "Analytics (Plausible / Google Analytics) + cookie consent",
    paths: ["src/components/analytics"],
    dependencies: [],
    devDependencies: [],
  },
  docker: {
    label: "Dockerfile for container hosts (Railway, Fly, any Docker host)",
    paths: ["Dockerfile", ".dockerignore"],
    dependencies: [],
    devDependencies: [],
  },
};

export const MODULE_IDS = /** @type {(keyof typeof MODULES)[]} */ (Object.keys(MODULES));

export const OAUTH_PROVIDERS = ["google", "github", "azure", "slack_oidc"];

/** Template-repository files that don't belong in a generated app. */
export const ALWAYS_REMOVE = [
  ".git",
  "node_modules",
  ".next",
  ".env.local",
  "playwright",
  "playwright-report",
  "test-results",
  "supabase/.temp",
  "supabase/.branches",
  "packages",
  ".github/workflows/cli.yml",
  ".github/ISSUE_TEMPLATE",
  ".github/pull_request_template.md",
  "docs/CHANGELOG.md",
  "docs/TEST_RESULTS.md",
  "docs/RELEASE_CHECKLIST.md",
  "docs/FEATURE_MATRIX.md",
  "docs/screenshots",
  "public/llms.txt",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
];
