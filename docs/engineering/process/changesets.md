# Changesets Process

**Status:** Active
**Owner:** Engineering
**Last updated:** 2026-08-04
**Applies to:** `@deessejs/fp` and any future workspace package in this monorepo

This document describes how we use [Changesets](https://github.com/changesets/changesets) day
to day to accumulate changes across branches and produce releases. It complements the
[`docs/engineering/plans/release-pipeline.md`](../plans/release-pipeline.md) senior plan,
which describes the *target* architecture. This page is the *current* practice.

---

## Goal: human-gated at merge, fully automated afterwards

The release process for `@deessejs/fp` is designed to be **fully automated from the
moment a pull request is merged into `main`**. Once a maintainer clicks "merge", no
further human action is required for the change to reach npm users.

Specifically, the chain that runs without any human intervention is:

1. `changesets/action` opens or updates the "Version Packages" pull request against
   `main`.
2. The Version Packages PR is reviewed and merged.
3. `publish.yml` runs on the pull_request closed (merged) event:
   - detects changesets,
   - bumps versions,
   - builds the package,
   - runs the test suite,
   - smoke-tests the built artifact,
   - publishes to npm under the `latest` dist-tag via Trusted Publishing (OIDC),
   - creates the `vX.Y.Z` git tag,
   - creates the GitHub Release page.
4. The auto-backmerge workflow propagates `main` to `staging` (and any active
   `feature/*` branches rebase from `staging`).

The only human-gated steps are:

- The author opens a pull request with a Changeset file (§ 7).
- A reviewer approves the pull request.
- A reviewer approves the Version Packages PR.
- A reviewer merges the Version Packages PR.

Everything between "merge to `main`" and "user installs the new version from npm" is
mechanical. There is no manual `pnpm version`, no manual `pnpm changeset publish`,
no manual tag push, no manual GitHub Release. The pipeline is the maintainer's
guarantee that every merged change ships.

This is a deliberate trade-off: speed and consistency over discretionary review. If a
change should not ship (broken code, security incident, partial feature), the place
to stop it is *before* the merge, not after. Once a PR is on `main`, the release is
imminent.

---

## 1. Why we accumulate changesets

A Changeset is a small Markdown file under `.changeset/`. The file declares *which package*
is affected, the *semver level* (`major` / `minor` / `patch`), and a one-line summary. The
filename is a slug (e.g. `cyan-panda-dance.md`); the contents matter, the name does not.

The reason this workflow exists at all is that it makes concurrent feature work *mergeable
without conflict*. The classic case is two features that would otherwise both edit
`packages/fp/package.json#version`:

- `branch-a` and `branch-b` each add a Changeset file:
  - `branch-a` adds `.changeset/cyan-panda-dance.md`.
  - `branch-b` adds `.changeset/heavy-lion-sing.md`.
- The Changeset files do not overlap. Merging both branches is a clean fast-forward.
- At release time, the tool reads *every* Changeset in `.changeset/`, computes the next
  semver, edits `package.json`, regenerates `CHANGELOG.md`, and deletes the consumed
  Changeset files.

This avoids the version-edit conflict entirely. The trade-off is that the actual version
number is decided *at release time*, not at PR-merge time. The author decides the *impact
level* of their change at code time; the tool rolls them up later.

---

## 2. The branch flow

We follow the branching model in [`CLAUDE.md`](../../../CLAUDE.md):

```text
main  <-  staging  <-  dev
```

| Branch | Role | Receives PRs from | Changesets on this branch |
| --- | --- | --- | --- |
| `dev` | Day-to-day work | `feature/*`, `fix/*` | Yes, added by authors |
| `staging` | Integration / release train | `dev`, `feature/*`, `fix/*` | Yes, accumulated from merged branches |
| `main` | Releases only | Version Packages PR (auto), hotfix PRs | No, consumed by `pnpm changeset version` |

A typical release cycle follows this path:

1. **Feature work happens on `dev` (or short-lived `feature/*` branches).**
   Each PR adds a Changeset file under `.changeset/`. The author picks the semver level
   that matches the impact of their change:
   - `patch` — bug fix, internal refactor, CI/doc change.
   - `minor` — backwards-compatible API addition.
   - `major` — breaking change to the public API. Rare; must be called out in the PR
     description.

2. **Feature branches are merged into `staging`.**  
   Multiple Changeset files accumulate. They never conflict, because each one is a
   distinct file.

3. **A release engineer opens (or updates) the Version Packages PR.**  
   In the current pipeline this is automated by `changesets/action@v2` on push to
   `staging`. The PR runs `pnpm changeset version`, which:
   - reads every Changeset in `.changeset/`,
   - computes the next semver from the highest-impact level present,
   - rewrites `packages/fp/package.json#version`,
   - regenerates `packages/fp/CHANGELOG.md`,
   - **deletes the consumed Changeset files**.

4. **The Version Packages PR is reviewed and merged into `main`.**  
   This is the only path that lands a new version on `main`. It is a regular PR; no
   special permission is required to merge it.

5. **The release workflow on `main` runs.**  
   Build, test, smoke-test, `pnpm changeset publish --tag latest`, tag, GitHub Release.
   The `main` commit no longer contains Changeset files — they were deleted in step 3.

---

## 3. The double-merge trap

The most common operational mistake with this flow is the **double-merge**. It is worth
calling out explicitly because it is silent: nothing fails, but the next release ends up
with an unexpected version bump.

The trap:

1. PR-A (with `.changeset/cyan-panda-dance.md`) is merged into `staging`.
2. PR-B (with `.changeset/heavy-lion-sing.md`) is merged into `staging`.
3. `changesets/action` opens a Version Packages PR. Both Changesets are still on
   `staging` at this point.
4. The Version Packages PR is merged into `main`. `pnpm changeset version` runs as part
   of the merge, consuming both Changesets. `main` now has version `1.1.1` and **no
   Changeset files**.
5. The release workflow publishes `1.1.1`. Done.
6. *Without the back-merge*: `staging` still has both Changeset files. If a maintainer
   opens another Version Packages PR from `staging` (or if `changesets/action` does),
   it will run `pnpm changeset version` *again* and produce `1.1.2` with the *same*
   release notes, because the Changeset files were never removed from `staging`.

The fix is mechanical: after a Version Packages PR is merged into `main`, back-merge
`main` into `staging` (and into `dev` if `dev` is long-lived). This is normally done
automatically by the release workflow, but it must be done — and it must be done *after*
the version bump lands on `main`, not before.

The same rule applies, with reversed direction, after a hotfix lands on `main`: back-merge
`main` into `staging` and `dev` so the hotfix version is reflected in the integration
branch.

---

## 4. Authoring a Changeset

This section is the writing guide. It complements the per-PR requirement described in
§ 7 — that section says *every PR must have a Changeset*; this one says *how to write a
good one*.

### 4.1 The shape

A Changeset is a single Markdown file under `.changeset/`. Its filename is a slug
(Changesets generates one when you run `pnpm changeset`); the contents matter, the
filename does not. The contents follow this shape:

```md
---
"@deessejs/fp": minor
---

Add the `Result.tryCatch` and `Maybe.tryMaybe` families.
```

The first `---` block is YAML frontmatter: a mapping from package name to semver level.
The body is the summary that will land in `CHANGELOG.md` and the GitHub Release notes.
There is no required header inside the body; a single paragraph is the typical shape, but
multi-line Markdown (code blocks, lists, links) is fine if the change warrants it.

### 4.2 Choosing the semver level

The semver level encodes the **impact on the consumer of the package**, not the size of
the diff. A 200-line internal refactor is `patch`; a one-line rename of a public symbol
is `major`. The decision tree:

- **`major`** — anything that *requires* a consumer to change their code to keep working.
  A symbol renamed or removed. A signature change. A behaviour change that flips a
  default. If you can answer "yes, a user has to edit their code" with confidence, it is
  `major`. Major bumps are rare and must be called out in the PR description.
- **`minor`** — anything that *adds* a new capability without breaking existing code.
  A new exported function. A new method on `Ok` / `Err` / `Some` / `None`. A new option
  on an existing function. If the change is purely additive, it is `minor`.
- **`patch`** — anything that *fixes* a bug, *improves* an internal detail, or *changes
  documentation*. A wrong type narrowing. A clearer error message. A perf tweak. A CI
  change. A typo in a docstring.

Cases that come up often and are easy to misclassify:

- **Refactor that exposes a new public export**: usually `minor`, because the export is a
  new capability, even if the refactor itself was internal.
- **Bug fix that happens to change a default value**: usually `major`, because consumers
  that depended on the old default will break.
- **Deprecating a symbol without removing it**: `minor` with a clear note in the summary;
  removal of the same symbol later is `major`.
- **Performance improvement with no API change**: `patch`. Consumers do not need to
  change anything.
- **Type-only change that narrows or widens a return type**: if a consumer's code stops
  compiling, it is `major`; if it now compiles *better* (more precise inference), it is
  `minor` or `patch` depending on whether the change is additive or corrective.

When in doubt, default to `minor` and call it out in the PR description. It is cheaper
to ship a `minor` that turns out to be a `patch` than a `patch` that turns out to be a
`major`.

### 4.3 Writing a good summary

The summary line is what shows up in `CHANGELOG.md` and the GitHub Release. It is
written for the **user upgrading the package**, not the maintainer reviewing the PR. A
good summary tells the reader, in one sentence, what they get or what they have to watch
out for.

Conventions in the wider Changesets ecosystem, which we follow:

- **Past tense for completed changes**: "Added `Result.tryCatch`", "Fixed incorrect
  narrowing in `Maybe.map`". The release has already happened by the time the user reads
  the changelog.
- **Lead with the user-visible effect, not the implementation**: not "Extracted a helper
  for fold", but "Simplified error handling for nested `Result` chains".
- **Name the symbols involved**: users grep their changelog for the API they care about.
  "Add `Result.tryCatch`" is searchable; "Improve error handling" is not.
- **One logical change per file**: if a PR introduces two unrelated changes that warrant
  different semver levels, write two Changeset files. A single Changeset file can have
  multiple lines, but it should be one coherent change.

| Good | Bad | Why |
| --- | --- | --- |
| `Added Result.tryCatch that wraps a throwing function into a Result.` | `Add stuff` | The first names the symbol and the effect; the second is unsearchable. |
| `Fixed incorrect narrowing when match returns a Result on the err branch.` | `Fix bug` | The first is searchable and tells the user what was wrong; the second is noise. |
| `Renamed Maybe.fromNullable to maybe for consistency with Result constructors.` | `Update API` | The first tells the user which symbol moved; the second is a heading, not a sentence. |
| `Deprecated errOr; it will be removed in 2.0. Use err instead.` | `Deprecate` | The first tells the user what to do; the second is a label. |
| `Bumped minimum Node version to 22.14 to match the engines field.` | `Node bump` | The first explains the impact; the second is shorthand for maintainers. |

If a change needs more than a sentence to explain, multi-line Markdown is fine. Common
patterns:

- A short paragraph followed by a code block showing the new API.
- A short paragraph followed by a list of related changes.
- A short paragraph that references a longer doc page (e.g. the wiki or `apps/web`).

### 4.4 Multi-package changesets

When a single PR affects more than one package in the monorepo, list all affected
packages in the same frontmatter, each with its own semver level. The tool rolls them up
independently at release time.

```md
---
"@deessejs/fp": minor
"@deessejs/errors": patch
---

Add `Result.tryCatch` that returns typed errors from `@deessejs/errors` shapes.
```

A few rules:

- Each package gets the semver level that matches *its* impact, not the highest level
  across the PR. If `@deessejs/fp` adds a function but `@deessejs/errors` only adjusts an
  internal helper, the levels differ.
- If the changes in two packages are *unrelated* (different PRs accidentally bundled), do
  not bundle them. Split into two Changeset files.
- The summary should describe the user-facing effect of the bundle. If the changes are
  conceptually one feature, one summary is fine. If they are two features that happen
  to share a PR, prefer two Changeset files.

### 4.5 When a Changeset is empty

For changes that have **no user-visible effect at all** — a pure internal refactor, a
CI workflow change, a dependency bump with no behaviour change, a docstring typo — the
body of the Changeset is intentionally short and the semver level is `patch`. The
Changesets CLI ships an `--empty` flag for this case:

```bash
pnpm changeset --empty -- --patch
```

This produces a Changeset file with the right frontmatter and an empty body. The audit
trail is preserved (the file exists, the level is recorded), but the CHANGELOG entry
is a one-liner with no body. This is preferred over skipping the Changeset file
entirely, because the per-PR rule (see § 7) requires a Changeset for every PR and the
release tooling will trip on a missing file regardless of whether the change is
user-visible.

`--empty` is **not** an exemption. It is a *form* of Changeset, with the body left
intentionally empty because the changelog does not need to know.

### 4.6 Anti-patterns

What *not* to put in a Changeset. The list is short because most of these are caught by
the § 4.3 *good vs bad* table above, but they recur often enough to be worth calling
out explicitly.

- **Implementation chatter.** "Extracted the `fold` helper into its own module",
  "Refactored the type definitions to use a conditional type", "Added a private
  utility". The user does not care how you wrote it; they care what they get.
- **Internal cross-references.** "See PR #388", "Linked to the design doc in
  `docs/internal/`", "Companion to the changes in `packages/internal`". These rot as
  soon as the PR is renumbered or the doc moves.
- **Marketing.** "We're excited to announce", "This release brings powerful new
  capabilities". Releases are not press releases.
- **Multi-line apology.** "Sorry for the previous breaking change, this reverts..." is
  fine *once*; repeated in every release it becomes noise. State the change, not the
  history.
- **Bullet-point changelog when one sentence suffices.** A one-line summary that says
  "Fixed narrowing in `Maybe.flatMap`" is better than three bullets about the same
  fix. Reserve bullets for genuinely independent changes.
- **Empty body without `--empty`.** A Changeset file with frontmatter and no body looks
  like an authoring mistake. Use `pnpm changeset --empty` so the intent is explicit and
  the CLI does not prompt for a body.

### 4.7 A worked example

A PR adds a new `Result.tryCatch` and fixes a typing bug in `Maybe.flatMap`. Two
unrelated changes, two Changeset files:

```text
.changeset/cool-otters-dance.md
---
"@deessejs/fp": minor
---

Added `Result.tryCatch` that wraps a throwing function into a `Result<T, unknown>`,
narrowing to typed errors via the optional second argument.
```

```text
.changeset/heavy-lion-sing.md
---
"@deessejs/fp": patch
---

Fixed `Maybe.flatMap` losing the narrowed type when the callback returns `None`.
```

Note the two different semver levels, the two user-facing summaries, and the named
symbols. Both files exist; both will be consumed at the next `pnpm changeset version`.

---

## 5. Inspecting what will happen

Two commands are useful when reviewing a Version Packages PR or a release plan:

```bash
# Are there pending changesets? What would the next version be?
pnpm changeset status

# What would the next CHANGELOG.md entry look like, in detail?
pnpm changeset version --snapshot
```

`pnpm changeset status` is the supported, accurate way to answer "is there a release to
cut?" and is the recommended replacement for the `git diff` heuristic that some older
pipelines use.

`pnpm changeset version --snapshot` is non-destructive: it produces the bumped versions
and the regenerated changelog in a temp directory (printed to stdout) without writing
back to the working tree. It is safe to run locally for review.

---

## 6. The full picture

```text
dev / feature/*                    staging                              main
─────────────                      ────────                             ────
add .changeset/a.md ─┐
                     │
                     │  PR merge
                     ▼
                     │  accumulate     changesets/action runs           │
                     │  ─────────►     opens Version Packages PR        │
                     │                 on staging → main                │
                     │                                                 │
                     │                                                 │  PR merge
                     │                                                 ▼
                     │                                                 │  pnpm changeset version
                     │                                                 │  (bump + changelog +
                     │                                                 │   delete consumed
                     │                                                 │   changesets)
                     │                                                 │
                     │                                                 │  release workflow
                     │                                                 │  ────────────────►
                     │                                                 │  build → test →
                     │                                                 │  smoke → publish →
                     │                                                 │  tag → GitHub Release
                     │
                     │  back-merge from main
                     ▼
                  staging is now in sync with main: same version,
                  no leftover changesets, no surprise 1.1.2.
```

The single rule that holds this together: **after every merge into `main`, back-merge
`main` into `staging`**. Everything else in the diagram is mechanical.

### 6.5 Every merge to `main` is a release

This is the consequence that makes the workflow worth running: **once a pull request
lands on `main`, its content is published to npm**. There is no "merge now, release
later" mode, no "merge without publishing" mode, no way to land code on `main` without
producing a new version of `@deessejs/fp` under the `latest` dist-tag.

This is not a separate rule added on top of the workflow — it is a *consequence* of two
rules that already hold:

1. **Every PR adds a Changeset** (§ 7). The CI refuses to merge any PR that does not.
2. **The release workflow runs on every merge to `main`** (the `publish.yml` workflow
   fires on `pull_request.closed` events against `main`, gated on `merged == true`).

Put together: every merge to `main` carries at least one Changeset, and the workflow
publishes it. The release is therefore not a *decision* the maintainer makes; it is a
*mechanical effect* of a successful merge.

Two practical consequences follow:

- **There is no "batch PR" that lands several changes without triggering multiple
  releases.** Each merge produces one version, each Changeset in it produces one
  changelog entry. A maintainer who wants to ship five changes in one release must put
  them in the same PR (or in PRs merged between two consecutive `pnpm changeset
  version` runs — but that window is empty in this project, since `version` runs as
  part of the merge).
- **A PR that is purely documentation-only still produces a release.** The per-PR
  Changeset rule has no exemption for non-code changes (§ 7.3), so a PR that only
  touches `docs/` or `apps/web/` carries a `patch` Changeset (often empty via
  `pnpm changeset --empty`). The merge still produces a version bump on npm. This is
  the price of the rule and it is intentional — the audit trail is the point.

This is why the back-merge rule (§ 3, § 6) matters: every release is final, and the
single source of truth is `main`. `staging` must reflect `main` after every release,
otherwise a future Version Packages PR will replay Changesets that have already shipped.

---

## 7. Per-PR Changeset rule

**Every pull request must add a Changeset file under `.changeset/`.** This is not a
convention we encourage; it is a hard requirement enforced by CI. The rationale is that
the accumulation workflow described above only works if every change ships with a
Changeset — if any PR slips through without one, that change is *invisible* to the
release tooling and either ships silently or requires a hotfix to recover.

### 7.1 The rule

- A PR is compliant when its diff contains at least one file matching
  `^.changeset/.*\.md$`, excluding the `README.md` of the changesets folder itself.
- The rule applies to **every** PR that targets `staging`, regardless of the kind of
  change: feature, fix, refactor, CI change, docs change, dependency bump, anything.
- There are **no exemptions by category** — not for refactors, not for CI, not for
  docs. A PR that is "just a typo" still adds a Changeset (typically `patch` and a
  one-line summary).
- The only carve-out is technical: a Changeset is *required*, but its *content* may
  legitimately be empty. For changes with no user-visible effect, run
  `pnpm changeset --empty` to produce a Changeset file that records the no-op
  semver level. This keeps the audit trail intact without inflating the changelog.
- **Hotfix exemption.** A hotfix PR that targets `main` directly (see `hotfix.md` § 4)
  does **not** carry a Changeset on the merge commit. The per-PR rule's scope is
  `staging`, not `main`. The `changeset-check` CI job (§ 7.2 below) is gated on
  `pull_request.base.ref == 'staging'` and skips hotfix PRs. The audit entry for the
  hotfix is added afterwards via a follow-up PR on `staging` that follows the per-PR
  rule (see `hotfix.md` § 8), and the changelog entry appears in the next regular
  release. The hotfix exemption is the only carve-out, and it is *only* for hotfix PRs
  targeting `main`.

### 7.2 How it is enforced

The rule is enforced by a dedicated CI job, not by reviewer vigilance. The job runs on
every PR targeting `staging`:

- **Job name:** `changeset-check`.
- **Trigger:** any push to a PR whose base is `staging`.
- **Logic:** diff the PR head against the merge base on `staging`, list the files
  added, and assert that at least one matches `^.changeset/.*\.md$` (excluding
  `README.md`).
- **Result:** the job fails with a clear message linking to this section if no
  Changeset is present. The merge button stays disabled until the author adds one.
- **Status check:** `changeset-check` is a **required status check** on the
  `staging` branch protection ruleset, so a green run is a hard prerequisite for
  merge. There is no bypass — not for maintainers, not for hotfixes.

In other words, the mechanism is *blocking* by design. The Changesets GitHub Bot
(installed in non-blocking mode) provides a soft nudge on top: it comments on PRs
that lack a Changeset, but it is the CI status check that actually prevents the
merge.

### 7.3 Why no exemptions

A common objection is "this is just a refactor, it doesn't need a Changeset." The
counter-argument is operational, not semantic:

- **A refactor that ships in the same release as a feature will appear in the
  changelog anyway** — once the tool rolls up the changesets, the refactor is in
  the same version as the feature. Skipping the Changeset for the refactor does not
  hide it; it just removes the audit trail.
- **A refactor can break a downstream user in subtle ways.** A Changeset with
  `patch` and a one-line summary is the cheapest possible insurance against the
  "I didn't know this changed" report.
- **CI-only or docs-only changes are not exempt either**, because the *release
  tooling* doesn't know which is which. A blanket rule is enforceable; a
  category-aware rule is not.

The cost of a per-PR Changeset is roughly 30 seconds of author time. The cost of a
missing Changeset is, in the worst case, a silent regression in a published version.
The trade-off is unambiguous.

### 7.4 Author checklist

Before opening a PR, an author should have:

1. A local branch with the code change.
2. A new file under `.changeset/` whose frontmatter lists the affected packages
   and the semver level, and whose body is a user-facing one-line summary.
3. For pure refactors or no-user-impact changes, `pnpm changeset --empty` instead
   of a hand-written file.

When the PR is opened, the author should see the `changeset-check` job turn green
within a minute. If it turns red, the diff is missing a Changeset file — adding one
will turn it green on the next push.

---

## 8. Related documents

- [`docs/engineering/plans/release-pipeline.md`](../plans/release-pipeline.md) — the
  target architecture, including the Trusted Publishing setup and the `release`
  environment protections.
- [`docs/engineering/plans/release-pipeline-github-ui-setup.md`](../plans/release-pipeline-github-ui-setup.md)
  — the one-time GitHub-side configuration (Trusted Publisher, environment reviewers).
- [`hotfix.md`](hotfix.md) — the urgent-fix path. Operationally a PR against `main`
  directly; uses the same `publish.yml` workflow as a regular release.
- [`canary.md`](canary.md) — the pre-release snapshot path. Future feature, not
  currently implemented. Documented for completeness so the design is not lost.
- The published process page in the wiki, *Release Process*, which mirrors this document
  for an external audience.
