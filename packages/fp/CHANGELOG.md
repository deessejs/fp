# @deessejs/fp

## 6.0.0

### Major Changes

- 66f86a3: fix(fp): include `dist/` in the published tarball
  
  The published `@deessejs/fp` tarball (1.2.0 and later, including 1.3.0) contained only 8 files — the source `.ts` files were excluded by `.npmignore` but the compiled `dist/` output was not whitelisted, so it was missing. Consumers who installed the package got `ERR_MODULE_NOT_FOUND` when importing, because `package.json` points `main` / `exports["."].import` to `./dist/index.js` which did not exist in the tarball.
  
  Root cause: the previous `.npmignore` filtered out everything that should not ship (`src/`, `*.test.ts`, `*.config.ts`, …) but did not explicitly allow `dist/`. Since `dist/` is also gitignored, no rule kept it in the tarball.
  
  Fix: replace the deny-list `.npmignore` with an explicit `files` allow-list in `package.json`:
  
  ```json
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md",
    "LICENSE"
  ]
  ```
  
  The `files` field has a safer failure mode than `.npmignore` — a missing entry fails loudly at install time (the consumer sees the broken import) rather than silently publishing unintended content. It is also unaffected by the interaction between `.gitignore` and `.npmignore`, which the npm CLI wiki lists among the "known issues" of the ignore-file approach.
  
  Verified with `npm pack --dry-run` locally: the preview now includes `dist/index.js`, `dist/index.d.ts`, and the rest of the build output (114 files vs. 8 previously).

### Minor Changes

- 5e483d7: chore: migrate lint and format from ESLint and Prettier to oxlint and oxfmt
  
  Replaces the ESLint flat config in `packages/fp/eslint.config.js` and `apps/web/eslint.config.mjs` and the root `.prettierrc` with a single oxlint + oxfmt setup.
  
  - Adds `oxlint@^1.87` and `oxfmt@^0.72` as root dev dependencies.
  - Removes `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-next`, and the implicit `prettier` invocation.
  - New root configs: `.oxlintrc.json` (with `extends` from each workspace) and `.oxfmtrc.json` (migrated from `.prettierrc` via `oxfmt --migrate prettier`).
  - Per-workspace configs at `packages/fp/.oxlintrc.json` and `apps/web/.oxlintrc.json`. The web app finally gets a real `lint` script (it previously depended on `eslint-config-next` without one).
  - Scripts: root `format` and `format:check` now use `oxfmt`; per-workspace `lint` and `lint:fix` use `oxlint`.
  - Husky pre-commit now runs `pnpm format:check` so formatting drift is caught on commit.
  
  This is a developer-tooling change only. The published `@deessejs/fp` artifact, the public API, and the runtime behavior are unchanged.
  
  One real source fix was required: a stray Windows-1252 em-dash (0x97) in `docs/internal/product/features/result.md` was incompatible with the strict UTF-8 parser in oxfmt and has been replaced with the proper UTF-8 em-dash. The file rendered correctly in every browser and editor before, but the byte was technically invalid.

### Patch Changes

- 9bfb2cc: chore: rename agent guidance file from CLAUDE.md to AGENTS.md
  
  Moves the project instructions from `CLAUDE.md` to `AGENTS.md` and reduces `CLAUDE.md` to a single line containing `@AGENTS.md`, so that any tool that follows the `@<otherfile>` convention (Claude Code, Cursor, GitHub Copilot) will resolve the redirect to the canonical `AGENTS.md`.
  
  Why:
  
  - `AGENTS.md` is the cross-vendor convention for AI-agent guidance (Claude Code, Cursor, GitHub Copilot, Aider, Zed, etc.) — a single file that all of them read.
  - The old `CLAUDE.md` was Claude-specific. The new naming makes the project vendor-neutral without losing Claude compatibility (Claude Code also reads `AGENTS.md`).
  - The `@AGENTS.md` redirect keeps backward compatibility for any tool that still looks for `CLAUDE.md` and supports the redirect convention.
  
  Also updates 9 references to `CLAUDE.md` in the repo:
  
  - `README.md` and `packages/fp/README.md` (project tree comments)
  - `docs/engineering/plans/release-pipeline.md` (3 prose references)
  - `docs/engineering/process/changesets.md` (cross-link)
  - `.claude/agent-memory/design-engineer/{project_architecture,user_role}.md` (memory notes)
  - `.claude/agents/release-engineer/README.md` (agent instructions)
  
  No public API change. The published `@deessejs/fp` artifact is unaffected — `AGENTS.md` and `CLAUDE.md` are not in the package's `files` allow-list, so neither ships to npm.
- b218b28: Added a Vale-based prose lint job for the public documentation site (`apps/web/content`). The job runs only on PRs that touch the documentation and lints MDX files against a project vocabulary and the `Vale` and `proselint` styles.
- df0bc20: fix(ci): stop publish.yml from treating any package.json change as a release
  
  The `detect` job in `.github/workflows/publish.yml` previously
  triggered a release whenever `packages/fp/package.json` changed in
  `HEAD~1..HEAD`. Any fix PR that happened to touch `package.json` (for
  example, to add a `files` field, or to update a dev dependency entry)
  was misread as a version bump, and the workflow then tried to publish
  the current `package.json#version` to npm. The anti-republish guard
  in `validate` would refuse if that version was already live, otherwise
  the workflow would publish a release with an empty changelog and a
  half-baked version that had not gone through `changesets-version.yml`.
  
  A legitimate release commit — produced by `changesets-version.yml` and
  merged into `main` — has both:
  
  - one or more changeset files removed under `.changeset/`
    (excluding `config.json` and `README.md`, which are not changesets)
  - the `version` field of `packages/fp/package.json` strictly
    greater than in `HEAD~1`
  
  Require both. The change is verified locally against five scenarios
  (real release, fix PR touching package.json, orphan changeset
  deletion, manual version bump, and major release) and the detector
  returns the expected result in every case.
- b218b28: chore: remove stray temp/comments.md from the repository root
  
  The file was a personal brainstorming note that landed with the
  rewritten first commit and never belonged in the tracked tree. It is
  not referenced by any source, test, lint, build, or workflow.

## 5.0.1

### Patch Changes

- Run `pnpm --filter @deessejs/fp build` in the `publish` job before `pnpm changeset publish`.

  The previous workflow ran `pnpm install` and called `pnpm changeset publish` directly, never building the package. Every published artifact from this repository (1.3.0, 2.0.0, 2.0.1, 5.0.0) shipped without `dist/` despite `package.json#files` whitelisting it and `main` / `types` / `exports` pointing at it. Consumers importing `@deessejs/fp` got `ERR_MODULE_NOT_FOUND` because `./dist/index.js` did not exist in the tarball.

  This is the first release from this repository that consumers can actually use.

  Cleanup action required separately by a maintainer with npm publish rights: unpublish the broken `@deessejs/fp@5.0.0` from the registry. It was published less than an hour ago, well inside the 72-hour `npm unpublish` window for versions that have not been depended on.

## 5.0.0

### Major Changes

- Reset the published version to clear the previous npm history.

  The 1.x and 2.x versions on the npm registry were published from a different but related codebase (the same author, but a separate source tree with a different shape). That history is preserved on npm; this release does not unpublish it. Consumers pinning `^1.x` or `^2.x` (or `^3.x` / `^4.x`, also published by the same author from a third codebase) keep their current install.

  Consumers who want the current source-of-truth from this repository install `@deessejs/fp@5.0.0` (or later). The 5.0.0 release matches the code on `main` at the merge of #449.

  This release also makes the `@deessejs/fp` npm package reachable from this repository for the first time. The 1.x and 2.0.1 work that was prepared on this branch but never reached npm (see the 2.0.0 / 2.0.1 entries below) is folded into 5.0.0:

  - The `poll` helper added in 2.0.0, with the config-object signature refactored in the same release.
  - The provenance fix from 2.0.1 (npm publish no longer requires OIDC).
  - The structural changes from PR #448: `Result` and `Maybe` exposed via internal classes, `pipe` / `flow` / `identity` / `constant` / `flip` / `tupled` / `untupled`, the `fromThrowable` / `fromAsyncThrowable` / `attempt` / `withReporting` / `classifyError` family.
  - The migration from ESLint+Prettier to oxlint+oxfmt (PR #444).
  - The rename of the agent guidance file from `CLAUDE.md` to `AGENTS.md` (PR #447), with a senior-engineer persona and the rules for `@deessejs/errors` interop, including the new `Poll` / `Result` / `Maybe` surface.

## 2.0.1

### Patch Changes

- Disable npm publish provenance attestation for `@deessejs/fp`.

  The previous setting (`publishConfig.provenance: true`) requires OIDC, which is not configured on the npm package. Each publish attempt has been silently rejected by npm with `EUSAGE: Automatic provenance generation not supported for provider: null`, while the CI workflow reports success because the GitHub Actions orchestration itself runs to completion. The "Published @deessejs/fp@2.0.0!" line that appears in the publish job log is misleading; the package is not on the registry.

  Setting `provenance: false` lets `pnpm changeset publish` succeed with a regular npm token, no OIDC required. The trade-off is the loss of the Sigstore-signed provenance statement on the published artifact, which is acceptable for this package because:

  - The release pipeline is gated by PR review and CI on GitHub, so the build provenance is reconstructible from the tag.
  - Trusted Publishing can be re-enabled later (one line flip + a config on npmjs.com) without breaking consumers.

  This is a patch release because the only change is to the publish configuration, not the public API.

## 2.0.0

### Major Changes

- 1375fc5: feat(fp): add `poll` helper for iterative async processes

  Adds a small ADT for the "ask again later" pattern, useful for OAuth device flow, retry-until-ready loops, and similar iterative processes that need to discriminate between a successful resolution, a recoverable "keep going" outcome, and a final failure.

  Exports:

  - `Poll<S, E>` — discriminated union with three branches: `Pending<S>`, `Done<S>`, `Failed<E>`.
  - `PollOptions<S, E>` — `{ interval, backoff?, until?, maxAttempts?, exhausted? }` for tuning the loop.
  - `PollConfig<S, E>` — the single config object passed to `poll()`, with `initial: S` and `handler: (state: S) => Promise<Poll<S, E>>` plus all the loop options.
  - `pending(state)`, `done(value)`, `failed(error)` — constructors for the three branches.
  - `poll({ initial, handler, ...options })` — the runner. Loops, applies backoff between attempts, stops on `until` satisfaction, and fails with `exhausted(state, attempts)` when `maxAttempts` is reached.

  Returns `Result<S, E>`. The `Pending` branch is consumed by the loop and never reaches the caller; what reaches the caller is either a successful state or a final error.

  The runner does not catch exceptions thrown by `handler` — a handler that throws is treated as a programmer error and propagated. The convention is that `handler` returns `failed(error)` rather than throwing, which keeps error handling declarative.

  This is intentionally narrower than a full `Either<L, R>` type. It targets one specific shape of iterative process; it does not aim to be a general-purpose sum type. If a future use case needs a proper `Either` or a `TaskEither`, that can be added separately without replacing this helper.

  No runtime dependencies added. The implementation is one file plus a `setTimeout`-based `sleep` helper, ~140 lines including types and JSDoc.

- 1375fc5: breaking(fp): `poll` now takes a single config object

  `poll(initial, step, options)` is replaced by `poll({ initial, handler, ...options })`. The handler argument is renamed from `step` to `handler` because that is what the function does. The change is a hard break; no alias or deprecation path is provided because the previous API was unreleased.

  Before:

  ```ts
  const tokens = await poll<State, CliError>(
    { code, attempts: 0, interval: 5_000 },
    async (state) => {
      /* step */
    },
    {
      interval: 5_000,
      backoff: (state) => Math.min(state.interval * 2, 60_000),
      maxAttempts: 60,
      exhausted: (state, attempts) =>
        new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
    }
  );
  ```

  After:

  ```ts
  const tokens = await poll<State, CliError>({
    initial: { code, attempts: 0, interval: 5_000 },
    handler: async (state) => {
      /* handler */
    },
    interval: 5_000,
    backoff: (state) => Math.min(state.interval * 2, 60_000),
    maxAttempts: 60,
    exhausted: (state, attempts) =>
      new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
  });
  ```

  Why a single config object: the call site reads as one block instead of three positional arguments, the names (`initial`, `handler`) are explicit instead of positional, and the loop options sit at the same level as the state and handler rather than nested inside a third argument that suggests a lower-tier "advanced options" group. The `handler` rename matches the standard convention (`onClick`, `onChange`, etc.) for functions that handle an event or iteration.

  Type changes:

  - `PollConfig<S, E>` exported as a public type. It extends `PollOptions<S, E>` with `initial: S` and `handler: (state: S) => Promise<Poll<S, E>>`.
  - `PollOptions<S, E>` itself is unchanged.
  - The `step` name is gone; use `handler`.

  No new runtime dependencies. Tests stay at 100% coverage. The breaking change ships together with the original `poll` feature in this release series; no published artifact has ever used the old signature.

  Migrating: replace any existing `poll(initial, step, options)` call with `poll({ initial, handler: step, ...options })` and update the call signature accordingly. There is no automated codemod because the surface has not been published yet.

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
