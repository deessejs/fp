---
'web': patch
---

feat(web): add InstallCommand (humans/agents tabs + copy-to-clipboard)

Replaces the two shadcn `<Button>` CTAs in the home hero with a
single `<InstallCommand />` that mirrors the vercel/chat
install row: a "For humans" / "For agents" segmented control
sits over a pill-shaped command line with a circular copy
button on the right.

**New component**

- `apps/web/src/components/marketing/install-command.tsx` —
  Client Component (`"use client"`) because the active tab and
  the copy feedback are local state.
  - Two text tabs separated by a 1px `bg-border` divider. No
    active background — the active state is just a font-weight
    shift to `font-medium` and the color to `text-foreground`.
    The inactive tab stays at `text-foreground/60`. Matches the
    vercel/chat pattern (`For humans` / `For agents`).
  - The pill below holds `$ <command> ⧉`. The command text uses
    `font-mono text-sm`, the `$` stays at `text-muted-foreground`,
    the copy button is a `size-8` circular button with a
    `lucide-react` `Copy` icon by default and a green
    `Check` icon for 2s after a successful copy.
  - `navigator.clipboard.writeText` is called on copy. Insecure
    contexts (http) or denied permission silently no-op rather
    than throw.
  - Commands:
    - humans: `npm install @deessejs/fp`
    - agents: `npx skills add deessejs/fp`
  - Accessibility: `role="tablist"` / `role="tab"`,
    `aria-selected` on each tab, `aria-label` on the copy
    button (flips to "Copied" during the 2s feedback window),
    `focus-visible:ring-2 focus-visible:ring-ring/50` on every
    interactive element.

**Wired into the Hero**

- The two `<Button asChild size="lg">` (Get Started + npm
  install) are replaced by `<InstallCommand />`. The "Get
  Started" path now lives in the code block below; the
  pill IS the install action.
- The Hero stays a Server Component. Only `InstallCommand` is
  a client island; the rest of the centered header (badge,
  H1, sub) renders on the server.

**What did not change**

- The badge text, the H1 copy, the sub copy, the order of
  elements, the surrounding `<Section>` border-b rhythm, the
  responsive font scale, the full-width `<CodeBlock>` below.
- The shadcn `<Button>` import is removed from the Hero (no
  longer used). Other pages that import it are unaffected.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).
- Visual smoke test pending: the segmented control sits
  centered under the sub copy, the pill below shows the
  humans command, clicking the agents tab swaps the pill
  text, the copy button shows a green check for 2s after
  a successful copy.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
