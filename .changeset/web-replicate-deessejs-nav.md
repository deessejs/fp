---
'web': patch
---

feat(web): replicate the deessejs mega-menu in the home header

The home page header had three flat links (Docs, Examples,
DeesseJS) and a Radix Popover for mobile. The deessejs main
site uses a Radix NavigationMenu mega-menu with two
dropdowns (Products, Resources) of vertical category
columns and two flat links (Enterprise, Pricing), all
driven by a single NAV_SECTIONS array. This commit adopts
the same shape on the FP home, with the items repointed at
the FP surface.

**New: `apps/web/src/components/marketing/nav-sections.tsx`**

A `NAV_SECTIONS` array with four top-level sections:

- **Products** → 3-column dropdown with Templates
  (Getting started, API reference), Ecosystem (Errors,
  DRPC, Collections, UI — all deessejs.com), and FP surface
  (Examples, Changelog).
- **Resources** → 3-column dropdown with Learn (Result,
  Maybe, Unit), Use cases (Error handling, Validation),
  Explore (GitHub, npm).
- **Enterprise** → flat link to deessejs.com/enterprise.
- **Pricing** → flat link to deessejs.com/pricing.

The shape mirrors the deessejs main site so a future
backport is mechanical. The component takes
`{ pathname, variant: 'desktop' | 'mobile' }` and renders
accordingly.

**Modified: `apps/web/src/components/marketing/site-header.tsx`**

Now `"use client"`. The inline `<nav>` is replaced with
`<NavSections pathname={pathname} variant="desktop" />`.
The right slot (GitHub icon, theme switch, mobile
hamburger) is preserved. The desktop nav is hidden below
`md` to defer to the mobile popover.

**Modified: `apps/web/src/components/marketing/mobile-navigation.tsx`**

The Radix Popover still wraps the mobile nav, but the
inner content is now `<NavSections pathname={pathname}
variant="mobile" />` (General flat links + Products and
Resources accordions). A click handler on `Popover.Content`
closes the popover when the user activates any link.

**Modified: `apps/web/src/app/(home)/home.css`**

Adds the Radix `NavigationMenu` viewport/content
animation classes (fade + slide), the desktop
dropdown item styles (`.fp-nav-item`, `.fp-nav-eyebrow`,
`.fp-nav-item-desc`), and the mobile accordion animation
keyframes (`.fp-mobile-trigger`, `.fp-mobile-content`,
`.fp-mobile-chevron` rotation). The shadcn
`navigationMenuTriggerStyle()` helper does not exist in
this repo; the equivalent class set is inlined in
`nav-sections.tsx`.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
