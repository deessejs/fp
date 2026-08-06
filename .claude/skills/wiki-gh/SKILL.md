---
name: wiki-gh
description: Read and edit the deessejs/fp GitHub wiki via the gh CLI
---

## Mental model

The wiki is a Git repository at `deessejs/fp.wiki`. Pages are plain Markdown files
at the repo root. The filename (minus extension) becomes the page title. GitHub
renders each file as a wiki page; the URL is `https://github.com/deessejs/fp/wiki/<Page>`.

Two files have a special role:

- `Home.md` is the landing page (URL `/wiki/Home`).
- `_Sidebar.md` is the navigation sidebar shown on every page.

Anything else (`Release-Process.md`, `Hotfix-Flow.md`, etc.) is a regular page.
The sidebar links to them; without a sidebar link, a page is reachable by URL but
not from the navigation.

The wiki has **no REST or GraphQL API for content**. The only mutation path is
Git: clone, edit, commit, push. The REST API exposes only `has_wiki` on the
parent repo (`gh api repos/deessejs/fp --jq .has_wiki`).

The default branch is `master`. CI does not run on the wiki. The only validation
is whatever the maintainer does locally before pushing.

## Prerequisites

- `gh` CLI installed and authenticated.
- A GitHub account with write access to `deessejs/fp` (which grants push access to
  its wiki).

Authenticate and verify scopes:

```bash
gh auth status
# should list a token with the "repo" scope
```

Configure for this repo so subsequent commands can omit it:

```bash
gh repo set-default deessejs/fp
gh auth setup-git
```

## Clone the wiki

```bash
gh repo clone deessejs/fp.wiki ./fp.wiki
cd ./fp.wiki
```

The clone is a normal Git working copy. All standard Git operations apply
(`git status`, `git diff`, `git log`, etc.).

## Read a page

After cloning:

```bash
ls              # list all pages
cat Home.md     # read the Home page
```

Without cloning, use `git show` on the wiki repo:

```bash
git clone --depth 1 https://github.com/deessejs/fp.wiki.git /tmp/fp.wiki
git -C /tmp/fp.wiki show master:Home.md
```

## Create or update a page

Pages are files. The workflow is **edit, commit, push**.

### Create a new page

```bash
cd ./fp.wiki

cat > New-Page.md <<'MD'
> **Last synced from `docs/engineering/process/<file>.md` on YYYY-MM-DD.**
> The repo file is the source of truth. If the two diverge, follow the repo.

This page explains X. It is the first thing to read before doing Y.

## TL;DR

One-paragraph summary.

## Outline

1. [Section 1](#1-section-1)
2. [Section 2](#2-section-2)

## 1. Section 1

Content here.
MD

git add New-Page.md
git commit -m "docs(wiki): add New Page"
git push
```

### Update an existing page

```bash
cd ./fp.wiki
$EDITOR Home.md
git add Home.md
git commit -m "docs(wiki): clarify installation steps on Home"
git push
```

### Delete a page

```bash
cd ./fp.wiki
git rm some-page.md
git commit -m "docs(wiki): remove obsolete page"
git push
```

## Naming rules

- The filename (without extension) becomes the page title.
- Use only `[A-Za-z0-9._-]` in filenames. The GitHub web UI also rejects
  `\ / : * ? " < > |`.
- For multi-word titles, hyphens are conventional (`Release-Process.md`).
- File extension controls the renderer (Markdown by default; AsciiDoc, Textile,
  etc. are also supported).
- Reserved filenames: `_Sidebar.md` (sidebar) and `_Footer.md` (footer).
- Filename equals title at the URL: `My-Page.md` becomes `/wiki/My-Page`.

## Sidebar

`_Sidebar.md` is the navigation menu. It is a normal Markdown file with a list of
links:

```markdown
## `@deessejs/fp` wiki

- [Home](Home)
- [Release Process](Release-Process)
- [Hotfix Flow](Hotfix-Flow)

### External links

- [Repository](https://github.com/deessejs/fp)
- [npm package](https://www.npmjs.com/package/@deessejs/fp)
```

When you create a page, add it to the sidebar. Without a sidebar link, the page
is reachable only by URL.

## Pull before you push

If anyone else may have edited the wiki, rebase before pushing:

```bash
cd ./fp.wiki
git pull --rebase
git push
```

For automation, abort on conflict rather than force-push:

```bash
cd ./fp.wiki
git pull --rebase || { echo "wiki conflict, manual merge required"; exit 1; }
git push
```

## Configure a committer identity

Git requires `user.name` and `user.email` for commits:

```bash
cd ./fp.wiki
git config user.name "your-name"
git config user.email "you@example.com"
```

For automation, prefer a GitHub-provided no-reply email so contributions are
linked to your account:

```bash
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
```

## Pages structure convention

Each page in this wiki follows the same skeleton:

1. **Bandeau *Last synced*** pointing to the canonical doc in the repo.
2. **TL;DR** in 3-5 sentences, answering "what is this page about" and "what is
   its status (active / future / deprecated)".
3. **`## Outline`** (heading level 2) listing every section with anchor links.
4. **Sections** (`## 1. Foo`, `## 2. Bar`, etc.) — heading level 2, numbered
   when there are 3+ sections.
5. **Related documents** at the end, pointing to other wiki pages and to
   internal `docs/engineering/process/*.md` files.

Do not put a `#` (h1) title at the top of the file: GitHub Wiki already renders
the page title from the filename.

Use past tense in changelog-style summaries, dots and commas (no em dashes) in
prose, and present tense in procedural instructions.

## Limits and gotchas

- **Soft cap of 5 000 files** per wiki. Beyond that, some pages may become
  inaccessible. For larger documentation sets, prefer GitHub Pages.
- **Search-engine indexing** is limited to wikis with 500+ stars and configured
  to forbid public editing.
- **Branches** can be created locally, but only pushes to the default branch
  (`master`) are published.
- **Private repos** propagate their visibility: the wiki is private too and
  follows the repository's collaborator list.
- **No REST/GraphQL wiki endpoints**. The wiki is only manageable over Git.
- **First-page bootstrap**. If the wiki was never opened in the web UI, the
  `.wiki.git` remote may not exist yet. Create the initial page from the web UI
  once before automating.

## Quick reference

| Goal | Command |
| --- | --- |
| Check the parent repo's wiki flag | `gh api repos/deessejs/fp --jq .has_wiki` |
| Clone the wiki | `gh repo clone deessejs/fp.wiki ./fp.wiki` |
| List pages | `ls ./fp.wiki` |
| Read a page | `git -C ./fp.wiki show master:Home.md` |
| Create a page | write the file, `git add`, `git commit`, `git push` |
| Update a page | edit, `git add`, `git commit`, `git push` |
| Delete a page | `git rm <file>`, `git commit`, `git push` |
| Page history | `git -C ./fp.wiki log -- <file>` |
| Safe automation push | `git pull --rebase && git push` |