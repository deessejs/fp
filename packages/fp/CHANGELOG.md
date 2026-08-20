# @deessejs/fp

## 1.3.0

### Minor Changes

- 7e9b7fd: refactor(fp): replace plain-object Result/Maybe with internal classes behind the public factory functions
  
  The public API is unchanged. `Ok`, `Err`, `Some`, `None`, `Result`, and `Maybe` are now `type` aliases pointing at internal `OkImpl`, `ErrImpl`, `SomeImpl`, and `NoneImpl` classes. The classes are not exported; the factory functions (`ok`, `err`, `some`, `none`, `maybe`) remain the only public construction entry points.
  
  Chained type assertions on the previous implementations are gone. `none` is a single static instance.
  
  Also delivers the pipeable functions that the `TODO` comments in `result/index.ts` and `maybe/index.ts` have been signalling since v1.0: `map`, `flatMap`, `mapError`, `filter`, `tap`, `tapAsync`, `flatMapAsync`, `match`, `fold`, `getOrElse`, `getOrThrow`, `getOrNull`, `getOrUndefined`, `toMaybe`, `toResult`, `toArray`, `toIterable`, `isOk`, `isErr`, `isSome`, `isNone` — and the `get` projection for `Maybe`. They compose through `pipe`.
  
  See `docs/engineering/plans/architecture-classes.md`.
- 2a05140: feat(fp): add function utilities (pipe, flow, identity, constant, flip, tupled, untupled)
  
  Delivers the function utilities that the documentation has been
  promising since v1.0 (see `docs/internal/product/features/function-utilities.md`).
  
  - `pipe` — left-to-right function composition with a starting value.
  - `flow` — left-to-right function composition that returns a function.
  - `identity` — the identity function.
  - `constant` — wraps a value into a function that ignores its argument.
  - `flip` — swaps the first two arguments of a binary function.
  - `tupled` / `untupled` — tuple ↔ positional adapters.
  
  `pipe` and `flow` carry variadic overloads up to nine steps. Beyond
  that the tail collapses to `unknown` and the caller is on their own.
  
  These are the seven exports that the README and the documentation
  have been advertising. The pipeables shipped in PR #431 (`map`,
  `flatMap`, ...) are now usable through `pipe` as the JSDoc in
  `result/functions.ts` and `maybe/functions.ts` already documents.
  
  See `docs/engineering/plans/function-utilities.md`.
- aae1039: refactor(fp): unify error handling on Result, retire the Try module
  
  The standalone Try type is gone. Wrapping throwing functions is now part of the Result surface.
  
  New public API:
  - Result.fromThrowable(thunk or { onSuccess, onError }) returns Result<T, E>
  - Result.fromAsyncThrowable(thunk or { onSuccess, onError }) returns Promise<Result<T, E>>
  - UnhandledException, AttemptConfig, Attempt, NormalizedError, RetryConfig, DelayStrategy, ErrorReporter, ErrorContext, ReportableError, ErrorClassification, ClassificationRule, ErrorConstructor types live on Result
  - attempt, withReporting, classifyError are top-level exports backed by result/ modules
  
  Removed (no aliases; the previous Try PR was never published to npm):
  - Success, Failure, Try types
  - success, failure factories
  - try_, tryPromise aliases
  - mapTry, flatMapTry, matchTry, isSuccess, isFailure pipeables (and 11 others)
  - _tag Success / Failure discriminants
  - The src/try/ directory entirely
  
  Coverage stays at 100% on lines / branches / functions / statements.
  
  See docs/internal/product/features/result.md for the canonical documentation, including a new Wrapping Throwing Functions section.

### Patch Changes

- 4ad12c1: Split the CI's "Test + coverage gate" job into two: a fast `test`
  job and a `coverage` job that posts a sticky PR comment with the
  per-file coverage table. No source-code changes. The coverage
  threshold gate is disabled in this PR (lands with the test matrix
  in a follow-up).
- 726fb94: chore(release): sync main into staging
  
  Backports the CI/publish fixes from the 1.2.x release series and
  commit `119b1e8` (architecture rules, `Ok.filter` contract, drop
  dead dependency) into staging. No public API changes.
  
  - The `Ok.filter(predicate, errorFn)` contract is now part of the
    release notes: when the predicate fails and an `errorFn` is
    supplied, the result is `Err(errorFn(value))`; without `errorFn`,
    the `Ok` passes through.
  - Architecture rules mirrored in `src/index.ts` and the ADR pointer
    in `docs/engineering/architecture/decisions/`.
  - Release pipeline fixes from `main` (idempotent tag creation,
    `resolve-version` quoting, `--provenance` removal, etc.) now
    ship from staging.
  
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

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
