---
'web': patch
---

fix(web): replace the duplicative bento with 3 benefit cards and a Concepts row

The home page had two adjacent sections saying the same thing: a
6-tile bento grid of features and a 3-column "Use cases" grid
of snippets. The same three primitives (Result, Maybe, Unit) were
demonstrated twice, and the two grids were not differentiated.
A first-time visitor could not tell which was the pitch and
which was the table of contents.

**The new structure**

- `<BenefitsGrid>` — three benefit cards, each one answering a
  single question ("what does the library do for me?"): typed
  failures, explicit absence, composition. Each card links to a
  docs page. No code samples in the cards; the demonstration
  lives in the Before/After section, where it can be compared
  against plain TypeScript.
- `<ConceptsRow>` — three reference entries for the primitives
  (Result, Maybe, Unit), each a one-line description and a link
  to the docs. Lighter than the benefit grid on purpose; these
  are the table of contents behind the pitch, not pitches
  themselves.

The bento grid is removed. The marketing "Before/After"
comparison is now the only place on the page that shows code
side by side, which is the comparison the section makes a
promise about.

**Hero copy**

The hero H1 was rewritten to lead with the benefit, not the
category. The previous H1 named the library type ("A tiny
functional programming library for TypeScript"); the new one
names what the library does for the visitor ("Handle failures
and missing values explicitly."). The release badge
(`v5.0.0 just shipped`) is removed — the package is at a
mature version and the badge was self-promotional.

Two CTAs sit under the headline: a primary "Get started" link
to the docs, and a secondary "View examples" link to the
examples section. Below them sits the existing
`<InstallCommand>` (humans/agents segmented control) and a
single `<CodeBlock>` with a self-contained `parseAge`
example that exercises both branches of `Result.match`.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
