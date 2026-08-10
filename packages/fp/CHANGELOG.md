# @deessejs/fp

## 1.2.1

### Patch Changes

- e6d9df8: Back-merge of main to staging, bringing the publish.yml detect logic fix from PR #405. The detect job now uses --output JSON to count releases, so it correctly returns false when there are no changesets (e.g. on the merge commit of a Version Packages PR). The backmerge.yml now fetches origin/staging before reading it. After this lands, the pipeline should not regress on the next release.
- 2762759: Full end-to-end test of the release pipeline. Validates that changesets-version.yml opens a Version Packages PR against main after this changeset is merged into staging, that publish.yml runs end-to-end and publishes 1.1.3 to npm via Trusted Publishing (OIDC), and that backmerge.yml opens a backmerge PR from main to staging.
  No functional change to the library.
- 2762759: Full end-to-end test of the release pipeline. Validates that changesets-version.yml opens a Version Packages PR against main after this changeset is merged into staging, that publish.yml runs end-to-end and publishes 1.1.3 to npm via Trusted Publishing (OIDC), and that backmerge.yml opens a backmerge PR from main to staging.
  No functional change to the library.

## 1.2.0

### Minor Changes

- 04e3798: Release 1.1.0.
  
  Advances the version from 1.0.2 (the dummy release-test artifact) to 1.1.0 to bring the published version on npm into a clean state. The release pipeline is now end-to-end validated; this entry produces the first legitimate user-facing minor bump since the Trusted Publishing migration.

### Patch Changes

- 2814283: Back-merge of main to staging, bringing the changesets CLI v3 upgrade (PR #400) onto staging. The CLI was bumped from 2.31.0 to 3.0.0-next.5 to be compatible with changesets/action@v2.0.0-next.4. With this, the changesets-version.yml workflow should now run end-to-end and open a Version Packages PR against main on the next staging push.
- 97a72be: Back-merge of main to staging, bringing the changesets/action@v2.0.0-next.4 fix from PR #398 onto staging. With this, the changesets-version.yml workflow can resolve the action correctly and the Version Packages PR opens against main as designed.
- 9b6e5b5: Back-merge of main to staging, bringing the format: false fix from PR #402. Without this, changesets v3 tries to invoke prettier (not in devDependencies) and the format step fails. With format: false, the Version Packages PR pipeline runs end-to-end.
- 6e3b4fc: Bootstrap changeset for the back-merge of main onto staging. The new release pipeline (5-job publish, changesets-version.yml, backmerge.yml, ci.yml with changeset-check) now lives on staging. This PR carries no functional change; the changeset exists solely to satisfy the per-PR Changeset rule.
  After this PR merges, the Changeset file will be consumed by changesets-version.yml, producing a 1.1.3 patch entry (or whatever the next version is) that documents this bootstrap in the CHANGELOG.
- a59f5d1: End-to-end test of the new release pipeline on staging after the back-merge. This PR validates that changeset-check passes, that changesets-version.yml opens the Version Packages PR against main on merge, that publish.yml runs end-to-end, and that backmerge.yml keeps staging in sync.
  No functional change to the library.

## 1.1.2

### Patch Changes

- 62a6bf7: Release 1.1.1 — pushes the restructured README and enriched package metadata (keywords, bugs, peerDependenciesMeta) to npm. No functional change. Triggered via the tag-driven hotfix path of the release pipeline.

> **Note (2026-08-06).** `package.json#version` is at 1.1.1, but
> `CHANGELOG.md` tops out at 1.1.0. This is a known pre-branch
> inconsistency: the 1.1.1 release was prepared (see
> `.changeset/release-1.1.1.md`) but never consumed via
> `pnpm changeset version`. The pipeline branch this note lives in
> does not regenerate the CHANGELOG; the next release will produce
> a 1.1.2 (or 1.2.0) entry that implicitly covers the 1.1.1 work.

## 1.1.0

### Minor Changes

- 04e3798: Release 1.1.0.

  Advances the version from 1.0.2 (the dummy release-test artifact) to 1.1.0 to bring the published version on npm into a clean state. The release pipeline is now end-to-end validated; this entry produces the first legitimate user-facing minor bump since the Trusted Publishing migration.

## 1.0.2

### Patch Changes

- 301857b: Dummy e2e test of the release pipeline. No code or API change — only a documentation marker added to validate the Trusted Publishing path end-to-end. This entry can be reverted once the test is complete.

## 1.0.1

### Patch Changes

- 79fee31: Fix: emit explicit `.js` extensions on relative imports in the published `dist/` so Node ESM consumers (strict mode) can resolve them. This unblocks Vitest and other test runners that don't bundle on import.

  Switches `packages/fp/tsconfig.json` to `module: NodeNext` + `moduleResolution: NodeNext` and updates source-level relative imports to include the `.js` suffix, as recommended by the TypeScript team for dual ESM/CJS packages.

## 1.0.0

### Minor Changes

- c18a652: Release v1.0.0-alpha.1 - Core Types

  ### Minor Changes

  - Add `Result<T, E>` type with `Ok` and `Err` variants
  - Add `Maybe<T>` type with `Some` and `None` variants
  - Add `Unit` type for void-returning functions
  - Add constructors: `ok()`, `err()`, `some()`, `none()`, `maybe()`, `unit`
  - Add instance methods: `map`, `flatMap`, `filter`, `tap`, `fold`, `getOrElse`, `mapError`
  - Add type guards: `isOk`, `isErr`, `isSome`, `isNone`, `isUnit`
  - Add type utilities: `isResult`, `isMaybe`, `OkType`, `ErrType`, `SomeType`
