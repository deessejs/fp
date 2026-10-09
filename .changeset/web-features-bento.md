---
'web': patch
---

feat(web): turn the Features section into a 2x3 bento

The Features section was two stacked sub-grids (3 primitives +
3 use cases, both at the same weight). It is now a single
2-column bento with three visual rows:

- Row 1: 2 simple primitive tiles (Maybe, Result).
- Rows 2-3: 2 tall use-case tiles (`row-span-2`, Error
  handling, Optional values). The tall middle is the
  signal that these are the "what you can do with the
  primitives" stories.
- Row 4: 2 simple tiles (Unit, and a new "match() in 3
  lines" live-demo tile with an inline code snippet).

**What changed in `features-grid.tsx`**

- Replaced the two stacked sub-grids with one
  `grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-3 gap-4 p-6
  lg:p-8` container.
- Added a new `BentoTile` primitive (icon + eyebrow + H3 +
  body + footer link, with an optional inline `<pre>` for
  the live tile).
- New `LIVE_SNIPPET` constant renders the
  `ok(42).match({ ok: ..., err: ... }) // → 84` example
  in a muted inline code block inside the live tile.
- `PRIMITIVES` now only contains Maybe + Result (the two
  primitives worth featuring on the home). Unit moved to
  the bottom row.
- `USE_CASES` lost the `API Reference` entry; Error
  handling and Optional values remain as the tall
  middle row. The `API Reference` route is still linked
  from the live demo tile and from the docs.
- The `divide-x` / `divide-y` / `border-t` rhythm is gone.
  The `gap-4` between tiles is the only separator. The
  bento reads as one composition instead of a register.

**What did not change**

- The `<SectionHeader>` above the bento: same eyebrow
  ("The primitives"), same title ("Features"), same
  subtitle. No `action` link — the API Reference route is
  reachable from the live demo tile.
- The surrounding `<Section>` border-b rhythm.
- The `text-balance` / `[&:not(:first-child)]:mt-0` reset
  on body paragraphs.
- All links still point to the existing `/docs/*` routes.

**Mobile**

- The grid collapses to `grid-cols-1 grid-rows-6` on
  mobile, with the tall row becoming 2 normal-height
  tiles. The reading order stays: Maybe → Result → Error
  → Optional → Unit → match().

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing
  warnings in other files; the previous
  `hooks/Statically known Hook` warning on this file is
  gone because the dynamic `i < useCases.length - 1`
  branch was removed).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
