# Release checklist (Community)

## Automated (CI must be green)

- [ ] `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- [ ] `pnpm db:start && pnpm db:test` (pgTAP authorization tests)
- [ ] `pnpm run doctor` against the CI stack
- [ ] `pnpm test:e2e` (auth, CRUD, isolation, consent, axe, 375px + 1440px)

## Manual

- [ ] Clean-clone install by following only the README, ideally by someone who didn't write the code
- [ ] Hosted demo deployed from this tag; sign up / confirm / CRUD / sign out work there
- [ ] `docs/FEATURE_MATRIX.md` matches what's actually shipped (no 📅 marked ✅)
- [ ] `docs/CHANGELOG.md` has a section for this version with today's date
- [ ] `docs/TEST_RESULTS.md` updated with the real results
- [ ] Screenshots refreshed: `SCREENSHOTS=1 pnpm test:e2e screenshots`
- [ ] `docs/SECURITY_CHECKLIST.md` "before each release" items done
- [ ] No Pro code, private notes or credentials in the repo or its history (`git log -p | grep -iE "sk_live|sb_secret_|service_role"`)
- [ ] `LICENSE` copyright holder is correct

## Publish

- [ ] `package.json` version bumped; `git tag vX.Y.Z && git push --tags`
- [ ] GitHub release with notes from the changelog
- [ ] (First release) Settings → "Template repository" turned on; topics added; issue templates checked
