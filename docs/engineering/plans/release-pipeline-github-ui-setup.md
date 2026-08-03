# Release Pipeline — GitHub UI Setup

**Companion to:** [`release-pipeline.md`](./release-pipeline.md)
**Status:** Manual steps, run once per repository
**Estimated effort:** 30–45 minutes

This document lists every action that must be performed in the GitHub web UI and on npmjs.com to support the release pipeline. Each step is independent; if you stop halfway through, the repository still works, but publish cannot happen via Trusted Publishing until §4 and §5 are both done.

> **Pre-requisites**
> - You have admin access to the `deessejs/fp` GitHub repository.
> - You have publish-admin access to the `@deessejs/fp` package on npmjs.com.
> - The branch `feat/release-pipeline` is pushed to origin (or will be pushed right before §3).

> **Design choice:** **no dedicated team, no bypass on `main`.** The "release engineer" is a role (whoever opens the "Version Packages" PR), not a permission. Every merge into `main` goes through a regular PR with one reviewer. This keeps the audit trail uniform and avoids single-point-of-failure on a specific person.

---

## 1. Create the `release` GitHub Environment

**Why:** Environment protection rules add a human gate on any workflow that uses `environment: release`. The single environment covers the stable release path, the hotfix path, and the canary snapshot path — they all dispatch through `publish.yml` which uses `environment: release`.

**Path:** Repository → Settings → Environments → New environment

### 1.1 Environment `release`

- **Name:** `release`
- **Deployment branches and tags:**
  - Selected branches: `main`
  - Selected tags: `v*` (optional — only if you want hotfix tags to be deployable; the entrypoint's tag push trigger will run regardless)
- **Required reviewers:** add 1–2 named engineering maintainers. **Do not** add a team — keep it named individuals so accountability is explicit.
- **Wait timer:** 0 minutes
- **Allow administrators to bypass configured protection rules:** **OFF** (force even admins through review)

Save.

---

## 2. Branch Protection Rules

**Path:** Repository → Settings → Branches → Add rule

### 2.1 Rule for `main`

- **Branch name pattern:** `main`
- **Protect matching branches:**
  - ✅ Require a pull request before merging
    - ✅ Require approvals: 1
    - ✅ Dismiss stale pull request approvals when new commits are pushed
    - ✅ Require review from Code Owners
  - ✅ Require status checks to pass before merging
    - Required checks (when they exist): `changeset-check`, `lint`, `type-check`, `test`, `build`
  - ✅ Require conversation resolution before merging
  - ✅ Require signed commits
  - ✅ Require linear history (no merge commits)
  - ✅ Include administrators (everyone — including the release engineer — goes through the same flow)
- **Allow force pushes:** OFF
- **Allow deletions:** OFF
- **Allow specified actors to bypass required pull requests:** **leave empty**. There is no bypass list. The "Version Packages" PR is merged like any other PR.

Save.

### 2.2 Rule for `staging`

- **Branch name pattern:** `staging`
- **Protect matching branches:**
  - ✅ Require a pull request before merging
    - ✅ Require approvals: 1
  - ✅ Require status checks to pass before merging
    - Required checks: `changeset-check`, `lint`, `type-check`, `test`, `build`
  - ✅ Require linear history
- **Include administrators:** ON
- **Allow force pushes:** OFF
- **Allow specified actors to bypass:** none.

Save.

### 2.3 Rule for `dev` (optional)

If you keep `dev` as a long-lived branch in the future:

- **Branch name pattern:** `dev`
- Minimal protection (status checks only, no review required) — `dev` is a scratch space.

Skip if you adopted §13.6 (no long-lived `dev`).

---

## 3. Repository Ruleset — "PRs Default to `staging`"

**Path:** Repository → Settings → Rules → Rulesets → New ruleset → Branch ruleset

This is the belt-and-braces enforcement that complements branch protection. Since there is no bypass on `main` (§2.1), no one can push directly to `main`, but the ruleset adds an extra safety net by auto-closing any PR that tries to target `main`.

- **Name:** "PRs default to staging"
- **Enforcement status:** Active
- **Target branches:**
  - Include: `main`
- **Rules:**
  - ✅ Restrict branch creations: only via PR to `main`
  - ✅ Block force pushes
  - ✅ Require linear history (already covered by §2.1)
- **Bypass list:** **leave empty**. No actor bypasses this either.

Save.

### 3a. Alternative: a CONTRIBUTING.md-only policy

If the ruleset feels heavy, the same effect is achieved by:

- Branch protection §2.1 already requires a PR for `main` and includes administrators. With no bypass, the only way to land code on `main` is through a reviewed PR.
- A note in `CONTRIBUTING.md` stating "default PR target is `staging`" handles the social pressure.

The ruleset is a stronger guarantee but not strictly required. Pick one.

---

## 4. Tag Protection Rules

**Path:** Repository → Settings → Tags → Add rule (older UI) or via Rulesets (newer UI)

- **Tag pattern:** `v*`
- **Allowed creators:** **leave empty**. The publish workflow uses `GITHUB_TOKEN` (or an app token) to push tags as part of the run; tag protection rules with an empty allow-list still allow the workflow to push tags but block direct user pushes.
- **Block pushes:** enabled.

Why this design: since `main` has no bypass, no human can push a `v*.*.*` tag directly anyway. Tag protection becomes a defense-in-depth measure that prevents accidental force-push to existing tags. We do not need to enumerate "release engineers" because there are none.

---

## 5. Register the Trusted Publisher on npmjs.com

**Path:** https://www.npmjs.com/package/@deessejs/fp/access → Trusted Publishers → Add Trusted Publisher

> **Note:** the path is `https://www.npmjs.com/package/<name>/access`, not the global settings page. This trips people up.

**npm allows exactly ONE Trusted Publisher configuration per package** (verified against the npm docs as of 2026-08-03). The repository handles the three publish paths (stable release, hotfix, canary snapshot) with a **single workflow file containing all three**:

- `.github/workflows/publish.yml` contains three jobs (`release`, `hotfix`, `canary`), each with its own step list.
- All three jobs declare `id-token: write` and use `environment: release`.
- npm validates the workflow file containing the `pnpm changeset publish` step. Since every publish step is in `publish.yml`, the registered filename matches what npm sees in the OIDC `workflow_ref` claim.

> **Why not reusable workflows?** A previous iteration used an entrypoint + reusable workflow pattern. It failed because npm Trusted Publishing validates the **workflow file that contains the publish step**, not the caller. With reusable workflows, the OIDC `workflow_ref` claim pointed to the reusable file (e.g. `_publish-canary.yml`), which never matched the registered filename. npm surfaced this as a misleading `E404 Not Found` (see npm/cli #9088). The fix was to inline all publish steps into `publish.yml`.

### 5.1 Add the single Trusted Publisher entry

- **Provider:** GitHub Actions
- **Organization or user:** `deessejs`
- **Repository:** `fp`
- **Workflow filename:** `publish.yml`
- **Environment name:** `release`
- **Allowed actions:** `npm publish` (per §13.1 decision)

Save.

If a previous Trusted Publisher entry exists from an earlier iteration (with a different workflow filename), revoke it first: `npm trust revoke --id <id>` or via the npmjs.com UI, then add the new one.

### 5.2 Update package publishing access

Same page (`/access`) → "Publishing access":

- Select **"Require two-factor authentication and disallow tokens"**
- Save

### 5.3 Verify (do not skip)

At this point the Trusted Publisher is registered but no publish has happened yet. Confirm:

- The package's npm page shows exactly one Trusted Publisher entry: "Trusted Publisher: GitHub Actions — deessejs/fp — publish.yml" in the access tab.
- A `git push` to the branch containing `publish.yml` must be merged to `main` before the first publish — npm validates that the workflow file exists at the registered path.

---

## 6. Workflow Permissions (org-wide)

**Path:** Repository → Settings → Actions → General → Workflow permissions

- **Workflow permissions:** "Read repository contents and packages permissions".
  - The `publish.yml` workflow overrides with `id-token: write` at the job level, so the org-wide default can stay at read-only.
- **Allow GitHub Actions to create and approve pull requests:** **ON** — required for the Changesets "Version Packages" PR automation.

Save.

---

## 7. Optional but Recommended

### 7.1 Dependabot for GitHub Actions

The repo already has a dependabot config. Confirm `/.github/dependabot.yml` includes a `github-actions` ecosystem entry. If not, see `release-pipeline.md` Appendix A for the expected shape.

### 7.2 Code Owners for `.github/workflows/publish.yml`

The current `CODEOWNERS` file already covers `.github/`. Verify by reading `.github/CODEOWNERS`:

```
/.github/ @deessejs/engineering
```

This means any PR touching `.github/workflows/publish.yml` will require review from `@deessejs/engineering`. Keep it.

### 7.3 Notification channels

After the first publish, set up notifications for failed workflow runs in the `release` environment. Path: Repository → Settings → Notifications (or via the GitHub mobile app).

---

## 8. Verification Checklist

Before the first real publish, walk through this list:

- [ ] `release` environment exists, requires at least 1 named reviewer, restricted to `main`.
- [ ] `main` branch protection: PR required, 1 approval, linear history, signed commits, include administrators, **no bypass list**.
- [ ] `staging` branch protection: PR required, 1 approval, linear history, no bypass.
- [ ] Tag protection on `v*`: block force-push, no allow-list (workflow is the only creator).
- [ ] npmjs.com Trusted Publisher registered for `@deessejs/fp`, workflow filename `publish.yml`, environment `release`, allowed action `npm publish`.
- [ ] npmjs.com publishing access: "Require 2FA and disallow tokens".
- [ ] Workflow permissions: "Allow GitHub Actions to create and approve pull requests" ON.
- [ ] `.github/workflows/publish.yml` exists in `main` with the exact filename registered on npmjs.com.
- [ ] `.github/workflows/_publish-{release,hotfix,canary}.yml` do **not** exist on `main` (deleted in PR #372).

When all boxes are checked, the first dry-run publish can be attempted by pushing a tag on a hotfix branch (or any release-shaped push) to test the OIDC chain.

---

## 9. Rollback

If anything goes wrong:

- **Trusted Publisher registration**: edit or delete on `https://www.npmjs.com/package/@deessejs/fp/access`. Takes effect immediately. Use `npm trust revoke --id <id>` if needed.
- **Branch protection**: edit or delete the rule. Takes effect immediately.
- **Environment**: edit or delete the environment. Takes effect immediately.
- **Tag protection**: edit or delete the rule.

All steps in this document are reversible individually.
