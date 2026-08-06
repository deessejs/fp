# Release Pipeline — Senior Plan

**Status:** Proposed
**Owner:** Engineering
**Last updated:** 2026-08-03
**Supersedes:** ad-hoc `release.yml` workflow + `NPM_TOKEN` long-lived secret

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

### 7.3 Workflow shape (`release.yml`)

The release workflow runs **only on `main`**, triggered by the merge of the "Version Packages" PR (a regular `push` event, not a `pull_request.closed` event). This is the single canonical entry point to a release.

```yaml
name: Release

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      reason:
        description: 'Reason for manual publish (hotfix recovery)'
        required: true

permissions: {}

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false

jobs:
  release:
    if: >
      github.event_name == 'push' ||
      (github.event_name == 'workflow_dispatch'
       && contains(github.event.inputs.reason, 'hotfix'))
    runs-on: ubuntu-latest
    environment: release
    permissions:
      id-token: write
      contents: read
      pull-requests: read

    steps:
      - uses: actions/checkout@<pinned-sha>
        with:
          fetch-depth: 0
          ref: main

      - uses: pnpm/action-setup@<pinned-sha>
      - uses: actions/setup-node@<pinned-sha>
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
          package-manager-cache: false

      - run: npm install -g npm@latest

      - run: pnpm install --frozen-lockfile

      - name: Anti-republish guard
        run: |
          PKG=$(node -p 'require("./packages/fp/package.json").name')
          VER=$(node -p 'require("./packages/fp/package.json").version')
          if npm view "${PKG}@${VER}" version >/dev/null 2>&1; then
            echo "::error::${PKG}@${VER} is already published"
            exit 1
          fi

      - run: pnpm build

      - run: pnpm test

      - name: Smoke test the built artifact
        run: |
          node -e "import('./packages/fp/dist/index.js').then(m => { if (typeof m.ok !== 'function') throw new Error('ok() missing'); console.log('smoke OK'); })"

      - run: pnpm changeset publish --provenance --tag latest

      - name: Create GitHub Release
        uses: softprops/action-gh-release@<pinned-sha>
        with:
          tag_name: v$(node -p 'require("./packages/fp/package.json").version')
          generate_release_notes: true
```

Notes:

- `pull_request.closed` is intentionally **not** a trigger. The version bump is its own PR, and its merge to `main` is the natural `push` event.
- `workflow_dispatch` is restricted to hotfix recoveries only and must justify the reason in the input field (the input is logged in the workflow run for audit).
- Pinning by SHA — not by tag — for every third-party action. Tag-based refs are mutable and a rewritten upstream runs code we did not intend.

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

Workflow: `.github/workflows/hotfix.yml`

- Trigger: `push: tags: ['v*.*.*']` from a `hotfix/*` branch (merged into `main`).
- Behavior: minimal pipeline, no Changesets run, hard-coded `pnpm publish --provenance --tag latest` for the changed package(s).
- Uses a separate `hotfix` environment (smaller reviewer pool, faster SLA).
- The hotfix PR targets `main` directly (the one exception to the staging rule, justified by urgency and limited scope).
- After the hotfix is published, a back-merge from `main` to `staging` (and `dev`) is mandatory, plus a regular changeset PR documenting the fix on `staging`.

## 9. Why a thin custom wrapper may sit on top of `changesets/action@v2`

The default `changesets/action@v2` handles both the "Version Packages" PR and the publish step. We prefer to:

- Keep the version PR behavior (declarative, reviewable), with the PR base branch set to `main` and the source branch coming from `staging`.
- **Replace the publish step** with our hardened pipeline above (OIDC permissions, environment, anti-republish, smoke test, SHA-pinned actions).

The result is a custom job that:

1. Listens for `push` to `main` (which is what closes the Version Packages PR).
2. Re-runs `changeset status` and aborts if no pending changes remain.
3. Executes the hardened publish block from §7.3.

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

Ordered steps. Each is independently reversible.

1. **Configure branch protection and rulesets.**
   - On `main`: require PR, restrict who can push (release engineers + bots), require linear history, restrict who can dismiss reviews.
   - Add a repository ruleset that **forces the default PR target to `staging`** for non-release-engineer roles, or that auto-closes any PR targeting `main` opened by a non-engineer.
   - Update `CONTRIBUTING.md` and any onboarding doc: "Default PR target is `staging`. Do not open PRs against `main`."
2. **Align `package.json#repository.url`** in `packages/fp/package.json` with the actual GitHub repo. Verify `npm pkg get repository` matches.
3. **Create the GitHub `release` environment** with required reviewers and `refs/pull/*/merge` + `main` deployment branch restriction.
4. **Register the Trusted Publisher** on `https://www.npmjs.com/package/@deessejs/fp/access`, allowed action `npm publish`, environment name `release`.
5. **Rewrite `.github/workflows/release.yml`** to the hardened shape from §7.3. The trigger moves from "PR closed with label `version bump`" to "push to `main`".
6. **Rewrite `.github/workflows/build.yml`, `lint.yml`, `tests.yml`, `types.yml`** to run on `staging` (PR + push) and on `main` (push only). Add `permissions: contents: read`.
7. **Update `changesets/action` configuration** so the Version Packages PR targets `main` from a branch cut off `staging`.
8. **Add `canary.yml`** for PR snapshot publishes targeting `staging`.
9. **Run one full release** end to end. Confirm the package appears on npm with a `Built and signed on GitHub Actions` badge on the npm page and `npm audit signatures` returns clean.
10. **Switch npm Publishing access to `Require 2FA and disallow tokens`**.
11. **Revoke the legacy `NPM_TOKEN`** GitHub secret.
12. **Document the new flow** in `CONTRIBUTING.md` and link to this plan.

### 11a. Trigger migration choice

Two valid options; pick one and stick to it:

| Option | Trigger | Pros | Cons |
|--------|---------|------|------|
| A — "Version Packages" PR | `push` to `main` (after merging the version PR) | Diff is reviewable, no surprise releases, declarative | Slight learning curve for contributors |
| B — Label on regular PR | `pull_request.closed` + `merged == true` + label `version-packages` | Simpler, similar to today's flow | No review of the version diff; one missed label skips a release |

Recommendation: **Option A**. It eliminates the most common failure mode (forgetting the label) and makes releases an explicit, reviewable artifact.

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

Files that will be created or modified:

| Path | Action |
|------|--------|
| `.github/workflows/release.yml` | Rewrite per §7.3, §9. Trigger: `push` to `main`, plus restricted `workflow_dispatch` for hotfix recovery |
| `.github/workflows/canary.yml` | New — §8.1. Trigger: PR targeting `staging` |
| `.github/workflows/hotfix.yml` | New — §8.3. Trigger: tag push on `main` from a `hotfix/*` branch |
| `.github/workflows/build.yml` `lint.yml` `tests.yml` `types.yml` | Add `permissions: contents: read`, run on `staging` (PR + push) and `main` (push only) |
| `.github/PULL_REQUEST_TEMPLATE.md` | Add "Changeset" checkbox + notice that the default target is `staging` |
| `.changeset/config.json` | Keep `commit: false`, set `baseBranch: main`, consider `snapshot.useCalculatedVersion` for canary shape |
| `packages/fp/package.json` | Fix `repository.url`, add `engines.node: ">=22.14.0"`, optionally `publishConfig.provenance: true` |
| GitHub UI — branch protection | PR required on `main` and `staging`; linear history; no bypass list |
| GitHub UI — rulesets | Enforce "PRs default to `staging`"; auto-close or redirect PRs targeting `main` |
| GitHub UI — environments | Create `release` and `hotfix` environments with required reviewers; tag protection rules on `v*.*.*` |
| npmjs.com UI | Register Trusted Publisher, switch Publishing access to `Require 2FA and disallow tokens`, revoke `NPM_TOKEN` |
| `CONTRIBUTING.md` | Document the new flow, link to this plan, state the default PR target |
| Secrets | Remove `NPM_TOKEN`. Add `NPM_READ_TOKEN` only if private dependencies are reintroduced |

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
