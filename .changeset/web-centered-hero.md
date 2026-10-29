---
'web': patch
---

feat(web): center the home hero header (badge + H1 + sub + CTAs)

Mirrors the vercel/chat hero pattern: the badge pill, the H1, the
sub copy, and the CTA group are now centered on every breakpoint,
and a single full-width `<CodeBlock>` sits below the centered
header.

**What changed in `hero.tsx`**

- The outer flex container is now `items-center text-center` and
  the children no longer carry `items-start` / `text-left`. The
  whole header block reads as one centered group.
- `max-w-4xl` on the H1 widened to `max-w-5xl` to match the
  vercel/chat target.
- The CTA group became `items-center` (it stays `flex-col` on
  mobile and `flex-row` on `sm:`).
- `gap-14` on the section padding became `gap-12` — the centered
  layout breathes better with a slightly tighter vertical rhythm.

**What did not change**

- The badge text, the H1 copy, the sub copy, the CTA labels and
  hrefs, the snippet, the CodeBlock, the padding, the responsive
  font scale, the order of elements (text before code, for a11y).
- The component is still a Server Component and stays inside the
  existing `<Section>` wrapper, so the surrounding border-b
  rhythm is unaffected.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings in
  other files).
- `pnpm --filter web build` clean (25 pages).
- Visual smoke test pending: a centered badge, H1 and sub at
  `text-center`, CTAs side-by-side, full-width CodeBlock below.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
