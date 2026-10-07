---
name: project_architecture
description: Monorepo structure: pnpm workspaces + Turborepo, apps/web for docs
type: project
---

## Repository Structure

```
fp/
├── packages/          # Library packages (not yet populated)
├── apps/
│   └── web/           # Next.js documentation site
├── package.json       # Root: pnpm workspace + turbo config
└── AGENTS.md          # Project instructions (CLAUDE.md redirects here)
```

## Monorepo Tech Stack

- **Package Manager:** pnpm v10.30.3
- **Build System:** Turborepo v2.9.15
- **Package Tool:** Changesets (for versioning/releases)
- **Hooks:** Husky (pre-commit)

## Branching Strategy

```
main ← staging ← dev
```

- `main`: Production-ready code
- `staging`: Release testing
- `dev`: Work-in-progress

## Root Scripts

| Command           | Description             |
| ----------------- | ----------------------- |
| `pnpm build`      | Build all packages      |
| `pnpm test`       | Run all tests           |
| `pnpm dev`        | Dev mode all packages   |
| `pnpm lint`       | Lint all packages       |
| `pnpm type-check` | Type-check all packages |
| `pnpm changeset`  | Manage version changes  |
| `pnpm release`    | Build + test + publish  |

## Communication Rule

**Always communicate in English** in code and documentation (per AGENTS.md).

## Web Search

Use `fresh` CLI tool for web searches (not other methods).
