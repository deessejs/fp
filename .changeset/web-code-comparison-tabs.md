---
'web': patch
---

feat(web): add shadcn Tabs + CodeComparison with synchronized before/after

Replaces the static two-CodeBlock grid in the "Before & after"
home section with a tabbed code comparison. Each tab is a
distinct use case (Error handling, Optional values, Side effects,
Validation) and shows the same before/after pair side by side.

**New components**

- `apps/web/src/components/ui/tabs.tsx` — shadcn Tabs primitive
  built on the `radix-ui` monorepo package (already installed
  as a peer). Re-exports `Tabs`, `TabsList`, `TabsTrigger`,
  `TabsContent` with the canonical shadcn classes (pill-style
  selected state, focus-visible ring, etc). Marked `"use client"`
  because Radix Tabs is a client primitive.
- `apps/web/src/components/marketing/code-comparison-tabs.tsx`
  — client component that wraps a single shadcn `<Tabs>` with
  two `<TabsList>` (one per column). One Radix Tabs context
  means both lists share the active state by definition; no
  cross-component synchronization needed.
- `apps/web/src/components/marketing/code-comparison.tsx` —
  async Server Component. Pre-renders all 8 code snippets
  (4 examples × before/after) to Shiki HTML at build time,
  then passes the HTML map + the example list to the client
  wrapper. The `defaultColor: false` flag is required so
  dark mode can still flip the syntax colors via the CSS
  variables in `globals.css`.

**Layout**

- The two columns are separated by `lg:divide-x lg:divide-border`
  on the parent grid, matching the deessejs `ForWho` rhythm.
- On mobile (1 column), the divide becomes a `divide-y` so
  the two stacked code blocks still have a visual separator.
- The TabsLists sit flush above the code blocks, with the
  `bg-muted` pill contrasting against the `bg-card` code
  blocks underneath. The two lists read as distinct layers
  from the same component.

**Tabs content**

Four use cases, each with a vanilla TypeScript snippet on
the left and the @deessejs/fp equivalent on the right:

- Error handling: `number | undefined` → `Result<number, string>`
- Optional values: `User | null` → `Maybe<User>`
- Side effects: `void` return + module-level mutation → `Unit`
- Validation: `string | null` + throw → `Result<Form, string>`

**What is intentionally not done**

- The CodeBlock component is left in place. It is still
  imported and used by the Hero. The new CodeComparison
  uses inline pre-rendered Shiki HTML + a small
  `CodeHtmlBlock` helper inside `code-comparison-tabs.tsx`
  to match the visual chrome (traffic lights + filename
  bar) without depending on `<CodeBlock>` (which is an
  async Server Component and cannot be a child of a
  Client Component in Next 16).
- The active tab is not persisted to localStorage. The
  Tabs reset to "Error handling" on every page load, which
  matches the deessejs docs-site convention. Persistence
  can be added with a controlled `value` + `nuqs` later
  if the visitor feedback asks for it.
- No `noBorderB` prop needed here — the `<Section>` wrapper
  in the home page already provides the `border-b` rhythm.

**Validation**

- `pnpm type-check` clean.
- `pnpm lint` clean.
- `pnpm build` clean (25 pages, 11 workers).
- Visual smoke test at 1280px: 4 tabs above each code
  block, both lists show the same active tab in lockstep
  (clicking one switches both), `divide-x` between the
  two columns, Shiki syntax highlighting visible in dark
  mode. The Tabs triggers work via real mouse events
  (Radix Tabs uses `onMouseDown` for activation, not
  `onClick`).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
