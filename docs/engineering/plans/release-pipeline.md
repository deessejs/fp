# Release Pipeline — Senior Plan

**Status:** Proposed
**Owner:** Engineering
**Last updated:** 2026-08-03
**Supersedes:** ad-hoc `publish.yml` workflow + `NPM_TOKEN` long-lived secret

---

## 1. Goals

1. Authenticate every npm publish with **short-lived OIDC credentials** via npm Trusted Publishing. No long-lived `NPM_TOKEN` in repository secrets.
2. Emit **provenance attestations** for every published package, signed by Sigstore and linked to the build workflow.
3. Keep the release decision **human-gated** while automating every mechanical step (versioning, changelog, tagging, publishing).
4. Apply **defense in depth**: independent gates must all fail closed before a package becomes `latest` on npm.
5. Support **stable releases**, **canary snapshots** per PR, **pre-release cycles** (`next`/`beta`), and **hotfixes**, without divergent tooling.
6. Stay consistent with `CLAUDE.md` (`main <- staging <- dev`) by making the branch strategy **executable**, not only documented. **All developer PRs target `staging`.** `main` is updated through a reviewable PR (the "Version Packages" PR, or a hotfix PR) — there is **no bypass on `main`**; every merge goes through PR review.

## 2. Non-Goals

- Migrating away from Changesets.
- Publishing more than one package to npm in this iteration (the design anticipates it, but `@deessejs/fp` is the only published package today).
- Multi-registry publishing (GitHub Packages, private registries).
- Self-hosted runners — Trusted Publishing does not support them.

## 3. Current State (Baseline)

| Area | Today | Gap |
|------|-------|-----|
| Authentication | `NPM_TOKEN` (secret) | Long-lived, leak-prone |
| Provenance | None | No verifiable build link |
| Release trigger | `workflow_dispatch` OR PR closed with label `version bump` | Label is easy to forget; no human review on the version diff |
| Branch strategy | `main <- staging <- dev` documented in `CLAUDE.md` | Not enforced by any CI workflow |
| Default PR target | Whatever GitHub offers (today: `main`) | Developers can land features directly on `main`, bypassing `staging` review |
| PR template | No changeset checkbox | Easy to merge a feat without a changeset |
| Environment protection | None | Any push to `main` with secret access can publish |
| Anti-republish guard | None | Risk of double-publish on retry |
| Smoke test post-build | None | A broken dist can reach npm |
| `package.json#repository.url` of `@deessejs/fp` | Points to `nesalia-inc/fp.git` | Does not match the actual repository, will fail OIDC validation |

## 4. Target Architecture

```
        ┌──────────────────────────────────────┐
        │  developer pushes a PR -> staging    │
        │  (base branch enforced via rules)    │
        └────────────────┬─────────────────────┘
                         ▼
   ┌──────────────────────────────────────────┐
   │  CI on PR (staging): lint / types /      │
   │  tests / build / changeset-check         │
   └────────────────┬─────────────────────────┘
                    ▼
        PR merged into `staging`
                    │
                    ▼
   ┌──────────────────────────────────────────┐
   │  On push to staging:                     │
   │   - CI re-runs on staging (full suite)   │
   │   - changesets/action opens or updates   │
   │     a "Version Packages" PR from         │
   │     staging -> main                      │
   └────────────────┬─────────────────────────┘
                    ▼
   Release engineer reviews the version diff
                    │
                    ▼
        Merge "Version Packages" PR into `main`
                    │
                    ▼
   ┌──────────────────────────────────────────┐
   │  publish.yml runs on main as six jobs    │
   │  in a chain: detect → bump → push-bump  │
   │  → validate → publish → release          │
   │                                          │
   │   - detect: runs `pnpm changeset        │
   │     status`; emits has_changesets        │
   │   - bump: runs `pnpm changeset version`  │
   │     on main locally                      │
   │   - push-bump: rebase onto origin/main,  │
   │     then push back (closes the #384      │
   │     non-fast-forward race)               │
   │   - validate: in `release` environment,  │
   │     anti-republish guard, pnpm build,    │
   │     pnpm test, smoke test on dist/       │
   │   - publish: `pnpm changeset publish     │
   │     --tag latest` via OIDC               │
   │   - release: git tag vX.Y.Z and          │
   │     GitHub Release with auto notes       │
   │                                          │
   │  Concurrency group: per-PR, not per-ref,  │
   │  so a hotfix landing during a regular    │
   │  release is not serialized. The anti-    │
   │  republish guard in `validate` is the    │
   │  safety net for the race.                │
   └────────────────┬─────────────────────────┘
                    ▼
      Provenance attestation generated automatically
      (Trusted Publishing + public repo + public package)
```

Important: developers never open PRs against `main` directly. The only paths into `main` are:

1. The "Version Packages" PR opened automatically from `staging` (the release flow).
2. A back-merge from a `hotfix/*` branch.
3. A back-merge from `staging` performed manually by the release engineer when bypassing the Version Packages PR (exceptional).

Side channels for canary, pre-release, and hotfix are detailed in section 8.

## 5. Branch Strategy

| Branch | Role | Receives PRs from | CI |
|--------|------|-------------------|----|
| `dev` | Day-to-day work, draft | feature/*, fix/* | Lint + types + tests (fast) |
| `staging` | Integration / release train | `dev`, feature/*, fix/* | Lint + types + tests + build + changeset-check |
| `main` | Source of truth, releases | the "Version Packages" PR (auto), hotfix PRs | Same as `staging`, plus the release workflow is allowed to run here |

Rules:

- **Default PR target: `staging`.** This is enforced two ways:
  - GitHub branch protection on `main`: PR required, no bypass for anyone.
  - Repository ruleset (or `CODEOWNERS` + a required-reviewer pattern) that auto-closes or auto-redirects any PR targeting `main`.
- No direct push to `main` (branch protection, applies to administrators too).
- No bypass list on `main`. The "release engineer" is a **role**, not a permission — it's the person who opens the "Version Packages" PR from `staging`, not someone with elevated rights.
- `staging` allows direct push for trusted maintainers, but PRs are the default.
- `dev` is the working branch for early-stage work. It merges into `staging` once the feature is ready for integration.
- Pre-release cycles (`next`/`beta`) live on a dedicated `release/next` branch cut from `staging`, never on `main`.
- A hotfix lives on `hotfix/*`, is merged into `main` through a regular PR (which triggers publish), then back-merged into `staging` and `dev`.

## 6. Changesets Workflow

### 6.1 Daily practice

- Every PR that changes observable behavior adds a file under `.changeset/` (e.g. `.changeset/fix-356-esm-imports.md`):

  ```md
  ---
  "@deessejs/fp": minor
  ---

  Short, user-facing description of the change.
  ```

- Pure refactors, CI changes, or docs-only PRs use `pnpm changeset --empty` to record a no-op changeset, or add nothing if a follow-up CI job accepts merges without changesets.
- Semver discipline:
  - `patch` — bug fixes, internal changes
  - `minor` — backward-compatible additions
  - `major` — breaking changes (rare; explicitly called out in PR description)

### 6.2 Enforcement

- A `changeset-check` job runs on every PR (targeting `staging`) touching `packages/fp/**`. It executes `pnpm changeset status --since=origin/staging` and fails the build when the result is non-empty without a changeset file in the PR. Mode: **blocking** once the team is comfortable.
- The Changesets GitHub Bot is installed in **non-blocking** mode to nudge contributors on PRs that lack a changeset, with a link to add one as a maintainer.

### 6.3 Version Packages PR (auto, staging -> main)

- On every push to `staging`, the `changesets/action@v2` workflow opens or updates a pull request titled "Version Packages" with the base branch set to `main`.
- That PR contains the result of `pnpm changeset version`: bumped versions, generated `CHANGELOG.md` entries, deleted changeset files.
- The PR is reviewable: any reviewer can see exactly which packages move and why, against the frozen `staging` snapshot. The role of "release engineer" is whoever opens this PR and shepherds the merge — it is **not** a special permission.
- No publish happens at this stage.
- `main` has branch protection (PR required, 1 approval) but **no bypass**. The "Version Packages" PR is merged like any other PR.

### 6.4 Publish

- When the "Version Packages" PR is merged into `main`, the custom release job (`changesets/action@v2` with a hardened publish script, or our thin custom wrapper — see §9) detects the merge and runs the publish pipeline (see §7).

## 7. Publish Pipeline (Trusted Publishing + Provenance)

### 7.1 npm-side configuration (one-time, per package)

On `https://www.npmjs.com/package/@deessejs/fp/access`:

- Add a Trusted Publisher:
  - Provider: GitHub Actions
  - Organization or user: `nesalia-inc`
  - Repository: `<current-repo>` (must match `package.json#repository.url` exactly, case-sensitive)
  - Workflow filename: `publish.yml`
  - Environment name: `release`
  - Allowed actions: `npm publish` (start), then `npm stage publish` after one stable month
- Publishing access: **Require two-factor authentication and disallow tokens**.
- Once a green publish via OIDC is observed, revoke any existing automation `NPM_TOKEN` on npm and remove the GitHub secret.

### 7.2 GitHub-side configuration (one-time)

- Create the `release` environment with:
  - Required reviewers: at least one engineering maintainer.
  - Deployment branches: `main` only (no PR refs — the publish workflow is triggered by a `push` to `main`, never by `pull_request.closed`).
  - "Allow administrators to bypass" disabled.
- Under Settings → Actions → General → Workflow permissions: enable **Allow GitHub Actions to create and approve pull requests** (required for the "Version Packages" PR automation).

### 7.3 Workflow shape (`publish.yml`)

The release workflow runs on `pull_request.closed` events against `main`, gated on `merged == true`. This is the single canonical entry point to a release. The actual current file lives at `.github/workflows/publish.yml`; the shape is summarized here.

Six jobs run in sequence:



Concurrency: `release-${{ github.workflow }}-${{ github.event.pull_request.number || github.run_id }}`. Per-PR, not per-ref, so a hotfix landing during a regular release is not serialized. The anti-republish guard in `validate` is the safety net for the rare race.

Permissions:

- `detect` and `bump`: `contents: read`, `pull-requests: read`.
- `push-bump`: `contents: write` (must push the version bump).
- `validate` and `publish`: `id-token: write`, `contents: read`, in the `release` GitHub environment (OIDC for Trusted Publishing).
- `release`: `contents: write` (must push the tag and create the GitHub Release).

Notes:

- `pnpm changeset status` exits 0 on the happy path (pending changesets exist). The `detect` job inverts this to a `has_changesets` boolean. Config errors (e.g., packages changed but no changeset) exit non-zero and the job treats that as skip.
- The rebase in `push-bump` closes the non-fast-forward race that happens when two PRs merge into `main` within seconds. The `||` fallback in the concurrency group covers any future event type that lacks `pull_request.number`.
- Major-version tags (`@v4`, `@v2`) are used for actions; Dependabot can track them via a `.github/dependabot.yml` `github-actions` entry.
- The `release` job does not run in the `release` environment; it only needs `contents: write` for the tag push and GitHub Release. Keeping OIDC off the tag path keeps the trust boundary small.
- The current `publish.yml` does not have a `workflow_dispatch` trigger. Hotfixes use the same PR-merge flow (a hotfix PR targets `main` directly, see `hotfix.md` § 4). Any future `workflow_dispatch` would be a separate, maintainer-only entry point and would need explicit review.

### 7.4 Repository URL alignment

`packages/fp/package.json` must declare the actual GitHub URL of this monorepo (today `nesalia-inc/complete-package-template`, not `nesalia-inc/fp`). Trusted Publishing validates this field case-sensitively against the GitHub repo.

### 7.5 What provenance gives us

When the three conditions are met (Trusted Publishing, public repo, public package), npm automatically generates and publishes:

- A **provenance attestation** linking the tarball to the source commit, the workflow file, and the runner.
- A **publish attestation** signed by Sigstore and recorded in the public transparency log.

Users can verify with `npm audit signatures`. No flag is strictly required, but `--provenance` is passed for belt-and-braces compatibility with older npm versions on consumer machines.

## 8. Side Channels

### 8.1 Canary snapshots per PR

Workflow: `.github/workflows/canary.yml`

- Trigger: `pull_request: opened, synchronize, reopened` targeting `staging` (the default developer target). PRs targeting `main` are not expected and can be excluded defensively.
- Behavior:
  - `pnpm changeset version --snapshot canary` (does **not** get committed)
  - `pnpm changeset publish --tag canary --no-git-tag`
  - Comment on the PR with the install command: `pnpm add @deessejs/fp@canary`
- Why: validates the build and the publish path on every PR without touching the official version. No commit back to the branch (per Changesets snapshot release guidance).

#### 8.1.1 Known limitations

The Changesets snapshot-on-public-npm approach has trade-offs we accept for now:

- **Pollutes the public npm registry.** Every push to a PR publishes a package under the `@canary` dist-tag. Public. With a name that does not match semver expectations.
- **Concurrent PRs overwrite each other.** Two open PRs publishing snapshots at roughly the same time collide on the `canary` dist-tag; whichever publishes last wins. The earlier snapshot is no longer installable as `@canary`.
- **Requires a Trusted Publisher slot.** The `canary.yml` workflow needs its own entry on npmjs.com (see `release-pipeline-github-ui-setup.md` §5.3) — it cannot share the `release.yml` entry.
- **No retention control.** Old snapshots linger on the npm registry until manually unpublished (and `npm unpublish` only works within 72 hours of publish for non-scoped packages; for scoped packages the constraint is relaxed but still operationally awkward).

#### 8.1.2 The senior alternative we are not adopting (yet)

The 2026 industry-standard replacement is **[pkg.pr.new](https://pkg.pr.new/)** (StackBlitz, backed by Cloudflare):

- Each commit/PR gets an npm-compatible URL keyed by SHA, e.g. `npm i https://pkg.pr.new/deessejs/fp/@deessejs/fp@<sha>`.
- Zero pollution of the public npm registry.
- Per-SHA isolation: two concurrent PRs do not overwrite each other.
- The bot comments on the PR automatically.
- Monorepo-aware out of the box (`pkg-pr-new publish './packages/fp'`).
- Adopted in production by Vite, Vue, Nuxt, Svelte, Rolldown, Cloudflare workers-sdk.

We keep Changesets-based snapshots in this iteration because the setup is zero and we already have Changesets in the loop. The migration to `pkg.pr.new` is deferred to a follow-up PR; when it lands, `canary.yml` is removed and the trusted publisher slot for `canary.yml` is freed.

#### 8.1.3 The safety net that does not depend on canary

The `release.yml` workflow runs a smoke test (dynamic ESM import, exports presence check) on every release. This is the actual safety net: even if a broken change slips past review and merges, the publish fails before reaching npm. Canary is a courtesy for reviewers; the smoke test is the production guard.

### 8.2 Pre-release cycles (`next`, `beta`)

Used for breaking refactors or pre-stable cycles.

- Cut a branch `release/next` from `staging`.
- `pnpm changeset pre enter next`.
- Merge changesets as usual; each `pnpm changeset version` produces `<ver>-next.<n>`; publishes go to the `next` dist tag on npm.
- To promote to stable: `pnpm changeset pre exit`, then merge back through `staging` so the Version Packages PR lands the final publish on `latest`.

The warning from the Changesets docs is respected: pre-releases never run on `main` directly, and we never enter pre-release mode without a dedicated branch.

### 8.3 Hotfix

There is no dedicated `hotfix.yml`. A hotfix reuses the regular `publish.yml` workflow:

- A `hotfix/*` branch is cut from `main`.
- The hotfix PR targets `main` directly (the one exception to the PRs target `staging` rule, justified by urgency).
- The PR does **not** carry a Changeset file (the per-PR Changeset rule is scoped to `staging`; see `changesets.md` § 7.1).
- When the PR merges, `publish.yml` runs as for a regular release.
- After the hotfix is published, `backmerge.yml` opens a back-merge PR from `main` to `staging` (auto-merge after CI).
- A follow-up PR on `staging` carries the audit-trail Changeset for the hotfix and lands in the next regular release.

The full procedure is documented in `hotfix.md`.

## 9. Why `publish.yml` is split from `changesets/action@v2`

The default `changesets/action@v2` handles both the "Version Packages" PR and the publish step. We separate the two:

- `changesets-version.yml` (uses `changesets/action@v2`) opens/updates the Version Packages PR against `main`. It does **not** publish.
- `publish.yml` runs on `pull_request.closed` (merged) against `main` and publishes the version that the Version Packages PR brought in.

The composition is:

1. `changesets-version.yml` opens a Version Packages PR with the bumped version and regenerated CHANGELOG.
2. The Version Packages PR is reviewed and merged.
3. `publish.yml` runs on the merge commit via `pull_request.closed`. It detects pending changesets via `pnpm changeset status`, bumps versions, rebases onto `origin/main`, validates with the OIDC-protected `release` environment, publishes, and tags.

This separation lets us evolve the publish pipeline (e.g. add stage publishing, swap npm CLI, add SBOM emission) without forking Changesets.

## 10. Security Properties

| Property | Mechanism |
|----------|-----------|
| No long-lived secrets | `NPM_TOKEN` removed once OIDC publishes green |
| Per-run authentication | OIDC tokens minted per workflow run, scoped to the trusted publisher |
| Build provenance | Automatic via Trusted Publishing for public + public |
| Human gate on release | Required reviewer on the `release` GitHub Environment |
| No silent release path | `main` branch protection with no bypass — every merge requires a PR with review |
| Action supply-chain hardening | Every third-party action pinned by SHA |
| Cache poisoning mitigation | `package-manager-cache: false` on the publish job |
| Replay / re-publish defense | Anti-republish guard aborts if the version is already on npm |
| Tag abuse mitigation | Git tag protection rules block force-push on `v*.*.*`; tags are created only by the publish workflow |
| MFA at the npm side | `Require 2FA and disallow tokens` on the package settings |
| Optional final gate | Switch `Allowed actions` to `npm stage publish` only; human promotion via `npm stage approve` with MFA |

## 11. Migration Plan

The pipeline described in this plan is now in place. The migration steps landed as part of the `ci/release-pipeline-hardening` branch (PR #394):

1. **Branch protection configured.** `main` requires PR, no direct push, no bypass.
2. **`package.json#repository.url` aligned** with the actual GitHub repo.
3. **GitHub `release` environment created** with required reviewers and `main` deployment-branch restriction.
4. **Trusted Publisher registered** on `https://www.npmjs.iom/package/@deessejs/fp/access`, environment name `release`.
5. **`.github/workflows/publish.yml` rewritten** to the six-job shape from ✀7.3 (detect, bump, push-bump, validate, publish, release). Trigger: `pull_request.closed` (merged) against ``main``.
6. **Consolidate CI into `.github/workflows/ci.yml`** with four parallel jobs (lint, typecheck, build, test) plus a new `changeset-check` job  that enforces the per-PR Changeset rule on PRs targeting `staging`.
7. **`.github/workflows/changesets-version.yml` added** to open/update the Version Packages PR against `main` on every push to `staging`.
8. **`.github/workflows/backmerge.yml` added** to auto-open a backmerge PR from `main` to `staging` after every push to `main`.
9. **Run one full release end-to-end.** The 1.1.0 release on `main` validated the pipeline.
10. **Switch npm Publishing access to `Require 2FA and disallow tokens`**.
11. **Revoke the legacy `NPM_TOKEN` GitHub secret.** No long-lived npm credentials in the repository.
12. **Document the new flow** in README and `CONTRIBUTING.md`, pointing to this plan.

11a. Trigger migration choice

The pipeline follows the "Version Packages" PR approach (Option A below). This is enforced by the current setup: `changesets-version.yml` opens the Version Packages PR against `main` on every push to `staging`. Merging that PR into `main` fires `publish.yml` (one of the `changesets-action@v2` outputs already staged in the PR by the Changesets action), which completes the release.
## 12. Observability and Auditing

- Every release writes a `GitHub Release` with auto-generated notes and a `provenance` link to the workflow run.
- The npm page shows the attestation summary; `npm audit signatures` is the consumer-side verification.
- The release workflow emits step outputs (`published`, `published-packages`) usable for Slack/email notifications.
- Failed releases leave a clear marker: the merge happened but the publish job errored, with a step-level `::error::` annotation.
- A monthly audit checklist (manual):
  - Rotate the reviewer list of the `release` environment.
  - Confirm no `NPM_TOKEN` exists in repo or org secrets.
  - Confirm `Repository` field of the Trusted Publisher still matches the GitHub URL.
  - Confirm the SHA pins of third-party actions are still current.

## 13. Resolved Decisions

The following questions were resolved during planning review on 2026-08-03:

1. **Stage publishing**: start with `npm publish` (direct). Switch to `npm stage publish` after the first clean release month, once the team has internalized the flow.
2. **Changeset-check enforcement**: non-blocking for the first two weeks (Changesets bot reminders only). Bump to blocking once reminder fatigue is observed.
3. **Linked groups in Changesets**: not anticipated now. Configure `linked`/`fixed` only when the second package is ready to be published.
4. **Hotfix trigger**: PR-only. The tag `v*.*.*` is pushed from the merged PR into `main`. Direct tag pushes are rejected by tag protection rules.
5. **Release engineer identity**: no dedicated team, no bypass. The release engineer is a **role** — whoever opens the "Version Packages" PR from `staging` and shepherds its merge. Everyone merges `main` through a regular PR with a reviewer; there is no shortcut for "release engineers".
6. **`dev` branch**: not materialized. `feature/*` and `fix/*` branches target `staging` directly. The model `main <- staging <- dev` documented in `CLAUDE.md` is preserved as a conceptual model where `dev` is the collective name for the per-feature work-in-progress, not a long-lived branch.

## 14. Revisit Later

These decisions are time-boxed. Re-evaluate at the checkpoints noted:

- After 1 clean release month → revisit §13.1 (consider stage publishing).
- After 2 weeks of bot reminders → revisit §13.2 (consider blocking mode).
- When a second publishable package appears → revisit §13.3.
- After the first hotfix lands → revisit §13.4 (was the PR overhead justified?).

---

## Appendix A — File Inventory

The pipeline described in this plan is implemented in four workflow files under `.github/workflows/`:

| Path | Action | Status |
|------|--------|--------|
| `.github/workflows/ci.yml` | Lint, typecheck, build, test, plus `changeset-check` on PRs targeting `staging`. | Active |
| `.github/workflows/publish.yml` | Six-job release: detect, bump, push-bump, validate, publish, release. Trigger: `pull_request.closed` (merged) against `main`. | Active |
| `.github/workflows/changesets-version.yml` | Opens/updates the Version Packages PR against `main` on every push to `staging`. Does not publish. | Active |
| `.github/workflows/backmerge.yml` | Auto-opens a backmerge PR from `main` to `staging` after every push to `main`. Anti-recursion via branch-scope trigger, label check, and SHA-keyed concurrency. | Active |

Future channels (documented in § 8, not yet implemented):

- `canary.yml` — per-PR snapshots on the `canary` dist-tag (see § 8.1).
- `prerelease-cycles.yml` — `next` / `beta` / `rc` phases (see § 8.2).
## Appendix B — References

- Changesets — [Automating Changesets](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md)
- Changesets — [Prereleases](https://github.com/changesets/changesets/blob/main/docs/prereleases.md)
- Changesets — [Snapshot Releases](https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md)
- Changesets — [`changesets/action`](https://github.com/changesets/action)
- npm — [Trusted Publishers](https://docs.npmjs.com/trusted-publishers/)
- npm — [Generating Provenance Statements](https://docs.npmjs.com/generating-provenance-statements/)
- GitHub — [OIDC token configuration](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- Phil Nash — [Things you need to do for npm trusted publishing to work](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/)
- Codenote — [Hardening npm Publishing with Trusted Publishing](https://codenote.net/en/posts/npm-trusted-publishing-oidc-staged-hardened-release/)
- PyColors — [Fixing npm Trusted Publishing in a pnpm Monorepo](https://pycolors.io/blog/npm-trusted-publishing-github-actions-monorepo)
