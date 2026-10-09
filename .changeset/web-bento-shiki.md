---
'web': patch
---

feat(web): render the bento tile snippets with Shiki

Each tile in the Features bento now shows a Shiki-highlighted
code snippet instead of plain `<pre>` text. The snippets
inherit the same dual-theme (`github-light` / `github-dark`)
the rest of the home already uses, so the colors flip with
dark mode via the `global.css` `--shiki-*` CSS variables.

**New shared helper**

- `apps/web/src/lib/shiki.ts` — `highlightCode(code, lang?)`
  wraps `codeToHtml` with the project defaults:
  - `themes: { light: 'github-light', dark: 'github-dark' }`
  - `defaultColor: false` (mandatory for the dark-mode flip
    to work — without it Shiki emits inline `color:` styles
    that beat the CSS variables)
  - `lang: 'typescript'` by default
    The configuration lives in one place. `CodeBlock` and the
    new `<BentoSnippet>` both call into it; the previous
    `codeToHtml` calls were removed.

**New component**

- `apps/web/src/components/marketing/bento-snippet.tsx` —
  async Server Component. Pre-renders the snippet HTML at
  build time and lays it down via `dangerouslySetInnerHTML`
  inside a `bg-muted/30 border border-border` chrome that
  matches the rest of the marketing code blocks. The
  `[&_pre]:!bg-transparent [&_pre]:!p-0` Tailwind hooks kill
  Shiki's default `<pre>` background and padding so the
  snippet blends with the tile's chrome.

**FeaturesGrid changes**

- `FeaturesGrid` is now `async`. Six `<BentoSnippet>` calls
  pre-render the tile snippets in parallel at build time.
- The plain `<pre>{snippet}</pre>` block in `<BentoTile>` is
  replaced by `<BentoSnippet code={snippet} />`. The
  `flex-1` stays on the snippet wrapper so the "Learn more"
  footer still aligns to the bottom of each tile.

**CodeBlock change (intentional)**

- The home `CodeBlock` was using `theme: 'github-dark'`
  (mono-theme) before. It now goes through the shared
  helper too, so it becomes dual-theme. In light mode the
  hero code block switches from `github-dark` colors to
  `github-light` colors. The visual chrome (traffic lights
  - filename bar) is unchanged.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).
- Visual smoke test pending: every bento tile shows colored
  TypeScript syntax, dark-mode flip works, snippets fit in
  the tile height without overflow.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
