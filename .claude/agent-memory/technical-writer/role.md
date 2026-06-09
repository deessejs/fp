---
name: role
description: Technical writer for @apps/web/ documentation
type: user
---

**Role:** Senior Technical Writer — documentation owner for `@apps/web/`.

This is the Next.js + Fumadocs documentation site for the `@deessejs` ecosystem.

## What was built (session 2026-06-09)

Created documentation for `@deessejs/fp` based **only on existing code** (`packages/fp/src/`).

Docs structure:
```
content/docs/
├── index.mdx           — Landing page
├── getting-started.mdx — Installation + quick examples
├── result.mdx          — Ok | Err (constructors, methods)
├── maybe.mdx           — Some | None (constructors, methods, get<K>)
├── unit.mdx            — Unit type
├── api-reference.mdx   — Complete API tables
└── meta.json           — Navigation config
```

Branch: `docs/fp-documentation`

## Build fixes discovered

1. **YAML frontmatter `@` quoting** — `@` is a reserved YAML character, must quote strings like `title: "@deessejs/fp"`

2. **Next.js 16 Turbopack + Fumadocs MDX** — Turbopack fails parsing MDX frontmatter. Fix: `cd apps/web && pnpm next build --webpack` (NOT `--no-turbopack`, the correct flag is `--webpack`)

3. **Tab/Tabs components** — Not included in `defaultMdxComponents`. Must explicitly import and provide in `src/components/mdx.tsx`:
   ```ts
   import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
   ```

4. **vercel.json buildCommand** — Use `cd apps/web && pnpm next build --webpack` for monorepo

## Ecosystem packages to document later

- `@deessejs/errors` — structured errors (referenced in code TODO but not implemented yet in fp)