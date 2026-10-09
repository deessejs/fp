---
'web': patch
---

feat(web): extract CodeHtmlBlock (async Server Component) for the Tabs

The inline `<CodeHtmlBlock>` helper that lived at the bottom
of `code-comparison-tabs.tsx` is now a shared Server
Component at `apps/web/src/components/marketing/code-html-block.tsx`.
The two snippets inside the shadcn `<Tabs>` now go through
this component instead of being rendered locally.

**Why a new component instead of reusing `<CodeBlock>`**

`<CodeBlock>` is an async Server Component. Next 16 forbids
rendering one as a child of a Client Component, and the
shadcn `<Tabs>` wrapper is `"use client"`. The same rule
blocked the previous commit (`e8de8fc`) and forced the
inline helper.

The new `<CodeHtmlBlock>` Server Component runs the same
`codeToHtml({ lang, theme: 'github-dark' })` call the
`<CodeBlock>` does, returns a pre-rendered block (the
chrome is byte-for-byte identical: `h-full bg-background
border border-border`, the traffic-lights bar with the
filename, `p-3 text-xs` body), and is then mounted as a
plain React tree by the client wrapper.

**What changed**

- New `apps/web/src/components/marketing/code-html-block.tsx`
  — async Server Component. Mirrors `<CodeBlock>`'s chrome
  exactly so the Hero, the bento, and the Before/After
  section all read as the same code block surface.
- `code-comparison.tsx` — no longer calls `codeToHtml`
  directly. It now renders one `<CodeHtmlBlock>` per
  snippet (8 total, parallel via `Promise.all`) and passes
  the rendered ReactNodes down to the client wrapper.
  The previous dual-theme + `defaultColor: false` config
  is replaced with the mono-theme `github-dark` that
  `<CodeBlock>` uses, so the Before/After section now
  matches the Hero and the bento (no dark-mode flip on
  these snippets, by design — they read as "static code
  in a terminal window").
- `code-comparison-tabs.tsx` — the inline `<CodeHtmlBlock>`
  helper is gone. The `CodeComparisonData` type now holds
  `ReactNode` (the pre-rendered blocks) instead of HTML
  strings. The `<TabsContent>` simply renders the
  ReactNode for the active example.

**What did not change**

- The 4 examples (Error handling, Optional values, Side
  effects, Validation) and their before/after code.
- The single `<TabsList>` at the top, the 4 triggers, the
  two-column grid with `lg:divide-x lg:divide-border`.
- The other uses of `<CodeBlock>` (Hero, bento tiles) —
  the path that goes through `<CodeBlock>` directly
  remains unchanged.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing
  warnings in other files).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
