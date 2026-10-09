---
'web': patch
---

fix(web): add an FP-only home footer and stop inheriting the DeesseJS SaaS footer

The home page was inheriting `<AppFooter>` from the root
layout. `<AppFooter>` is the wider DeesseJS SaaS footer (7
columns: Ecosystem, Learn, Use cases, Company, Legal & Trust,
Community, Explore) with a Conway band and a "Software
engineering as a commodity" pitch. None of that is relevant
to a visitor who lands on `/` for `@deessejs/fp` specifically.
The visitor should be able to reach any FP-related
destination from the footer in one click: docs, npm, GitHub,
changelog, the sister `@deessejs/errors` package.

**Changes**

- New `<HomeFooter>` rendered only by `(home)/layout.tsx`.
  Three groups (Docs, Package, Project) plus a small brand
  column. All links resolve to FP-relevant destinations.
- `<AppFooter>` is moved from the root `layout.tsx` to
  `docs/layout.tsx`, so the docs section still gets it but
  the home does not.
- New `components/icons/brand.tsx` with `<GithubIcon>`.
  lucide-react intentionally does not ship brand marks
  (GitHub, npm, etc.), so the icon that was previously
  inlined as a 600-character `<path>` in `<AppFooter>` is
  now a real, named component. The home footer uses the
  same icon; the SVG path is no longer duplicated.
- The home footer reuses the existing `<FooterColumn>`
  primitive and follows the same link styling as the rest
  of the docs site.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
