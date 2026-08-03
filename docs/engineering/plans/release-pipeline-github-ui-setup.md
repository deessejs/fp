# Release Pipeline — GitHub UI Setup

**Companion to:** [`release-pipeline.md`](./release-pipeline.md)
**Status:** Manual steps, run once per repository
**Estimated effort:** 30–45 minutes

This document lists every action that must be performed in the GitHub web UI and on npmjs.com to support the release pipeline. Each step is independent; if you stop halfway through, the repository still works, but publish cannot happen via Trusted Publishing until §4 and §5 are both done.

> **Pre-requisites**
> - You have admin access to the `deessejs/fp` GitHub repository.
> - You have publish-admin access to the `@deessejs/fp` package on npmjs.com.
> - The branch `feat/release-pipeline` is pushed to origin (or will be pushed right before §3).

---

## 1. Create the GitHub Team `deessejs/release-engineers`

**Why:** §13.5 decision. A dedicated team avoids single-point-of-failure and makes audit trail explicit.

**Path:** Organization `deessejs` → Settings → Teams → New team

- **Team name:** `release-engineers`
- **Description:** "Members authorized to merge PRs targeting `main` (Version Packages PRs and hotfixes) and to bypass `main` branch protection."
- **Visibility:** Visible (recommended for audit clarity; can be secret if org policy requires)
- **Add members:** at minimum 2 engineers; rotate over time. Do **not** add bots.
- **Team role:** Maintain (or a custom role with `contents: write`)

Save and note the team slug: `deessejs/release-engineers`. You will need it in §3.

---

## 2. Create the `release` and `hotfix` GitHub Environments

**Why:** Environment protection rules add a human gate on any workflow that uses `environment: release`, and they let us pin which branches can deploy.

**Path:** Repository → Settings → Environments → New environment

### 2.1 Environment `release`

- **Name:** `release`
- **Deployment branches and tags:**
  - Selected branches: `main`
  - Selected tags: leave empty (we don't push release tags directly; the workflow creates them as part of the run)
  - This means the job can only run when the workflow is triggered by `push` to `main` (our intended path).
- **Required reviewers:** add the `deessejs/release-engineers` team
- **Wait timer:** 0 minutes
- **Allow administrators to bypass configured protection rules:** **OFF** (force even admins through review)

Save.

### 2.2 Environment `hotfix`

- **Name:** `hotfix`
- **Deployment branches and tags:**
  - Selected branches: `main`
  - Allow tag deployments if you want to use tag-pushed hotfixes later; otherwise leave empty.
- **Required reviewers:** a smaller subset — e.g. one engineer from `deessejs/release-engineers` plus one on-call. Document this in `CONTRIBUTING.md`.
- **Wait timer:** 0 minutes
- **Allow administrators to bypass:** OFF

Save.

### 2.3 Optional environment `canary`

If you want a dedicated environment for the `canary.yml` workflow:

- **Name:** `canary`
- **Deployment branches:** `staging`, plus the PR ref pattern if you want it tied to PR merges (`refs/pull/*/merge`).
- No required reviewers — canary publishes are non-blocking and informational.

Skip this environment if you're comfortable with no protection on canary.

---

## 3. Branch Protection Rules

**Path:** Repository → Settings → Branches → Add rule

### 3.1 Rule for `main`

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
  - ✅ Include administrators (everyone goes through the same flow)
- **Allow force pushes:** OFF
- **Allow deletions:** OFF
- **Allow specified actors to bypass required pull requests:** add the team `deessejs/release-engineers`. This is what lets the Version Packages PR and hotfix PRs target `main`.

Save.

### 3.2 Rule for `staging`

- **Branch name pattern:** `staging`
- **Protect matching branches:**
  - ✅ Require a pull request before merging
    - ✅ Require approvals: 1
  - ✅ Require status checks to pass before merging
    - Required checks: `changeset-check`, `lint`, `type-check`, `test`, `build`
  - ✅ Require linear history
- **Include administrators:** ON
- **Allow force pushes:** OFF
- **Allow specified actors to bypass:** none — everyone goes through review on `staging`.

Save.

### 3.3 Rule for `dev` (optional)

If you keep `dev` as a long-lived branch in the future:

- **Branch name pattern:** `dev`
- Minimal protection (status checks only, no review required) — `dev` is a scratch space.

Skip if you adopted §13.6 (no long-lived `dev`).

---

## 4. Repository Ruleset — "PRs Default to `staging`"

**Path:** Repository → Settings → Rules → Rulesets → New ruleset → Branch ruleset

This is the belt-and-braces enforcement that complements branch protection: even if a contributor manages to open a PR targeting `main`, it can be auto-closed.

- **Name:** "PRs default to staging"
- **Enforcement status:** Active
- **Target branches:**
  - Include: `main`
- **Rules:**
  - **Restrict branch creation** — not needed
  - **Require linear history** — already covered by §3.1
  - **Require pull request before merging** — already covered
  - **Block force pushes** — already covered
  - **Require deployments to succeed** — not applicable
  - **Require status checks** — covered by §3.1
  - **Require code scanning** — optional, recommended
  - **Add a custom rule pattern** — add: `pull_request_targeting_main`
- **Bypass list:** add `deessejs/release-engineers` so the Version Packages PR and hotfix PRs are not blocked.

Alternatively (simpler): rely on branch protection + a CONTRIBUTING.md notice. The ruleset adds automatic enforcement but is more complex to configure.

Save if you set one up.

### 4a. Alternative: simpler rule using GitHub's "Restrict who can push to matching branches"

Instead of a full ruleset, in the `main` branch protection rule (§3.1):

- Set "Restrict pushes that create matching branches" to "Only people with push access" and explicitly list `deessejs/release-engineers` as the only actors.

This is functionally equivalent for our use case.

---

## 5. Tag Protection Rules

**Path:** Repository → Settings → Tags → Add rule (older UI) or via Rulesets (newer UI)

- **Tag pattern:** `v*`
- **Allowed creators:** `deessejs/release-engineers`
- **Block pushes:** enabled

This prevents a contributor from accidentally (or maliciously) creating a `v1.2.3` tag and triggering a hotfix-style publish.

---

## 6. Register the Trusted Publisher on npmjs.com

**Path:** https://www.npmjs.com/package/@deessejs/fp/access → Trusted Publishers → Add Trusted Publisher

> **Note:** the path is `https://www.npmjs.com/package/<name>/access`, not the global settings page. This trips people up.

- **Provider:** GitHub Actions
- **Organization or user:** `deessejs`
- **Repository:** `fp`
- **Workflow filename:** `release.yml` (the file we'll add in the next implementation step)
- **Environment name:** `release`
- **Allowed actions:** `npm publish` (per §13.1 decision)

Save.

### 6.1 Update package publishing access

Same page (`/access`) → "Publishing access":

- Select **"Require two-factor authentication and disallow tokens"**
- Save

### 6.2 Verify (do not skip)

At this point the Trusted Publisher is registered but no publish has happened yet. Confirm:

- The package's npm page shows "Trusted Publisher: GitHub Actions — deessejs/fp" in the access tab.
- A `git push origin feat/release-pipeline` will be needed before the first publish (the workflow must exist in `main` for npm to validate).

---

## 7. Workflow Permissions (org-wide)

**Path:** Repository → Settings → Actions → General → Workflow permissions

- **Workflow permissions:** "Read and write permissions" (or "Read repository contents and packages permissions" if the workflow only needs to read).
  - For our `release.yml` we need `id-token: write` and `contents: read` set explicitly in the workflow, so the org-wide default can stay at "Read repository contents and packages permissions".
- **Allow GitHub Actions to create and approve pull requests:** **ON** — required for the Changesets "Version Packages" PR automation.

Save.

---

## 8. Optional but Recommended

### 8.1 Dependabot for GitHub Actions

The repo already has a dependabot config. Confirm `/.github/dependabot.yml` includes a `github-actions` ecosystem entry. If not, see `release-pipeline.md` Appendix A for the expected shape.

### 8.2 Code Owners for `.github/workflows/release.yml`

The current `CODEOWNERS` file already covers `.github/`. Verify by reading `.github/CODEOWNERS`:

```
/.github/ @deessejs/engineering
```

This means any PR touching `.github/workflows/release.yml` will require review from `@deessejs/engineering`, which is exactly what we want for the publish pipeline. Keep it.

### 8.3 Notification channels

After the first publish, set up notifications for failed workflow runs in the `release` environment. Path: Repository → Settings → Notifications (or via the GitHub mobile app).

---

## 9. Verification Checklist

Before the first real publish, walk through this list:

- [ ] `deessejs/release-engineers` team exists with at least 2 members.
- [ ] `release` environment exists, requires `deessejs/release-engineers`, restricted to `main`.
- [ ] `hotfix` environment exists, restricted to `main`.
- [ ] `main` branch protection: PR required, 1 approval, linear history, signed commits, bypass allowed only for `deessejs/release-engineers`.
- [ ] `staging` branch protection: PR required, 1 approval, linear history.
- [ ] Tag protection on `v*`: only `deessejs/release-engineers` can create.
- [ ] npmjs.com Trusted Publisher registered for `@deessejs/fp`, allowed action `npm publish`, environment `release`.
- [ ] npmjs.com publishing access: "Require 2FA and disallow tokens".
- [ ] Workflow permissions: "Allow GitHub Actions to create and approve pull requests" ON.
- [ ] `feat/release-pipeline` branch exists and contains the rewritten `release.yml` (next implementation step).
- [ ] `.github/workflows/release.yml` file exists in `main` with the exact filename registered on npmjs.com.

When all boxes are checked, the next implementation step (rewriting `.github/workflows/release.yml`) can be merged and a first dry-run publish attempted via `workflow_dispatch` with reason `hotfix` (to test the OIDC chain without burning a version number).

---

## 10. Rollback

If anything goes wrong:

- **Trusted Publisher registration**: edit or delete on `https://www.npmjs.com/package/@deessejs/fp/access`. Takes effect immediately.
- **Branch protection**: edit or delete the rule. Takes effect immediately.
- **Environment**: edit or delete the environment. Takes effect immediately.
- **Tag protection**: edit or delete the rule.

All steps in this document are reversible individually.
