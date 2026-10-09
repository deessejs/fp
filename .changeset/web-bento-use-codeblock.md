---
'web': patch
---

feat(web): render the bento snippets through the shared CodeBlock

The bento tiles now render their code snippets through the same
`<CodeBlock>` component the Hero uses, instead of a dedicated
`<BentoSnippet>` Shiki wrapper. The previous attempt introduced
a `lib/shiki.ts` helper and a `bento-snippet.tsx` component
that both diverged from the working Hero path; this commit
reverts that detour and reuses the proven component.

**Changes**

- `apps/web/src/components/marketing/bento-snippet.tsx` — deleted.
- `apps/web/src/lib/shiki.ts` — deleted (only the deleted
  `BentoSnippet` was using it; `CodeBlock` keeps its inline
  `codeToHtml` call with the original `theme: 'github-dark'`).
- `apps/web/src/components/marketing/features-grid.tsx` —
  the `<BentoSnippet code={snippet} />` inside `<BentoTile>`
  is replaced by `<CodeBlock code={snippet} size="sm"
  className="mt-4" />`. The rendered snippet is now visually
  identical to the Hero code block (mono-theme `github-dark`,
  traffic-lights bar is hidden because no `title` is passed,
  `bg-background` wrapper, `p-3 text-xs` body).

**What did not change**

- The bento layout (2x3 grid, 2 tall use cases, no gap, no
  padding, per-tile borders).
- The snippets themselves, the icons, the eyebrow labels, the
  H3, the body copy, the "Learn more" footer.
- The Hero `<CodeBlock>` — it is untouched.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
