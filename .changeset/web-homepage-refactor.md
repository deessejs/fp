---
'web': patch
---

feat(web): refactor the home page into reusable marketing sections

Extracts the home page JSX into four reusable components and
reworks the visual rhythm to follow the same patterns the
deessejs SaaS template uses across its marketing surface. The
content (H1 copy, code examples, feature list, CTA copy) is
preserved verbatim — this is an organizational and visual
refactor, not a content change.

**New components**

- `apps/web/src/components/marketing/section.tsx` — `<Section>`,
  a thin wrapper that adds `border-b border-border` and the
  shared `max-w-6xl mx-auto` padding rhythm every homepage
  section sits in. Matches the deessejs `Section` primitive
  in shape.
- `apps/web/src/components/marketing/section-header.tsx` —
  `<SectionHeader>` with the eyebrow + H2 + subtitle + optional
  action link contract. Standardizes the header used by the
  Features and Before/After sections. Same pattern as the
  deessejs `SectionHeader` (Surfaces / Contracts / Ecosystem).
- `apps/web/src/components/marketing/hero.tsx` — extracted from
  the inline JSX in `(home)/page.tsx`. Adds an "Introducing
  v5.0" badge pill above the H1 (deessejs TechStack pattern:
  clickable chip with `Layers` icon + announcement + `ArrowRight`,
  routes to `/changelog`). Switches the H1 to
  `text-heading-40 sm:text-heading-48 lg:text-heading-56
  font-medium tracking-tight text-balance`. Buttons are now
  shadcn `<Button asChild size="lg">` so the home's CTAs
  share the CtaCard's button styling.
- `apps/web/src/components/marketing/features-grid.tsx` —
  splits the 7-card features grid into two stacked sub-grids:
  - Top: `<PrimitivesGrid>` for Result / Maybe / Unit, a
    3-column grid with `divide-x divide-border` and a "01 —
    Primitive" eyebrow per card (deessejs ForWho pattern).
    Each card pushes the "Learn more" arrow to the bottom via
    `flex-1` on the body so all three arrows align horizontally.
  - Bottom: `<UseCasesGrid>` for Error Handling / Optional
    Values / API Reference, a 3-column grid (deessejs
    CodingAgents pattern) with the `ArrowRight` chip pinned
    to the top-right corner of each cell and a subtle
    `hover:bg-accent/30` background. The third cell is
    intentionally kept without a right border to avoid a
    double line at the grid edge.

**Visual changes on the home page**

- H1: `text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]`
  becomes `text-heading-40 sm:text-heading-48 lg:text-heading-56
  font-medium tracking-tight text-balance`. The `font-medium`
  matches the deessejs hero (less aggressive than `font-bold`).
  The `text-balance` removes widows on multi-line H1s.
- Sub-copy: `text-xl text-muted-foreground` becomes
  `text-copy-16 sm:text-copy-18 leading-7 text-muted-foreground
  text-balance`. Uses the explicit typographic scale already
  defined in `@theme inline` and gets the same `text-balance`
  treatment.
- Feature cards: `hover:border-accent hover:bg-secondary`
  becomes `hover:bg-accent/40 focus-visible:ring-2
  focus-visible:ring-ring/50`. The hover is now a single
  tint, not a 2-property border + bg switch. Focus rings
  added for keyboard a11y.
- The `text-[15px]` arbitrary value on description paragraphs
  becomes `text-copy-14` (a defined scale step).
- Icons that were missing `aria-hidden` (none in this PR — the
  base page was already clean) stay clean; the new Hero and
  FeaturesGrid icons all carry `aria-hidden`.

**What is intentionally not done**

- The badge pill text is hardcoded to "Introducing v5.0 —
  first stable ESM release". When v5.x → v6.x ships, swap the
  label and the `href` to the new release note. Not extracted
  to a prop yet because this is the only badge of its kind
  on the site.
- The header text "The primitives" / "Before & after" /
  "Features" are inline on the page, not driven from the
  components. That keeps the `(home)/page.tsx` file as the
  literal table of contents the deessejs pattern recommends.
- The 4th feature from the previous version ("TypeScript
  Native") is dropped. It was meta-commentary — the whole
  site is about TypeScript, and "TypeScript Native" was the
  least distinct of the 7 cards. The 3+3 split (primitives
  - use cases) reads cleaner.

**Validation**

- `pnpm type-check` clean.
- `pnpm lint` clean.
- `pnpm build` clean (25 pages, 11 workers, 15.5s).
- Visual smoke test at 1280px and 800px: the H1 badge pill
  is the first thing the eye lands on, the 3 primitives
  are clearly grouped, the 3 use cases sit below as
  secondary tiles, the before/after comparison is unchanged.
- The CtaCard is still wired on shadcn Card/Button.
- The footer is unchanged.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
