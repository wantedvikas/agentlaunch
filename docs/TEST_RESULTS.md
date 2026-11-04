# Test Results

Results exactly as they ran. Newest milestone first.

## C1 — 2026-11-04 (local, macOS arm64, Node 22.23.3, pnpm 12.16.1)

| Check | Command | Result |
| --- | --- | --- |
| Formatting | `pnpm format:check` | ✅ all files formatted |
| Lint | `pnpm lint` | ✅ 0 errors, 0 warnings |
| Typecheck | `pnpm typecheck` | ✅ 0 errors |
| Unit tests | `pnpm test` | ✅ 15 passed, 2 files |
| Build | `pnpm build` | ✅ 11 routes, all static |
| E2E smoke | `pnpm test:e2e` | ✅ 19 passed, 19 skipped (see note) |
| Screenshots | `SCREENSHOTS=1 pnpm test:e2e screenshots` | ✅ 16 images in `docs/screenshots/` |
| Secret scan | grep for Stripe/Supabase key patterns, JWTs, private keys | ✅ no matches |

**Note on skips:** 3 tests only apply at one viewport (mobile menu ×2, desktop sidebar), so they skip on the other. The 16 screenshot tests only run when `SCREENSHOTS=1` is set.

**E2E coverage (desktop 1440px and mobile 375px):** home CTA navigation, no horizontal overflow on all 5 pages, no console errors or hydration warnings on all 5 pages, skip link focus, theme toggle persists across reload, robots/sitemap/OG image served, branded 404 with status 404, mobile marketing menu, mobile dashboard drawer closes after navigating, sidebar `aria-current`, project dialog validation, Escape closes the dialog and returns focus.

**Unit coverage:** `cn` merging, theme resolution, nav active-path matching, project schema (valid input, trimming, 4 invalid cases), Button loading state, FormField aria wiring, ProjectFormDialog validation → honest "Not saved" notice.

### Not run in C1
- **GitHub Actions CI:** the workflow file exists, but no GitHub remote has been created yet.
- **Automated accessibility audit (axe):** planned for C3. C1 relies on Radix primitives, keyboard tests and manual review.
- **Measured color contrast:** tokens were chosen to aim for WCAG AA, but no contrast tool has checked them yet.
- **Browsers other than Chromium:** Firefox and WebKit are not run.
