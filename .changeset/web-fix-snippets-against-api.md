---
'web': patch
---

fix(web): rewrite marketing snippets against the real public API

The marketing code snippets (hero, features bento, before/after
comparison) drifted from the actual `@deessejs/fp` public API.
Several snippets referenced methods that do not exist or were
called with signatures that would not type-check. A user who
copies a snippet into a real project would hit a compile error
— a fatal trust problem for a library that advertises
type-safety as its main selling point.

**Fixed in `hero.tsx`**

- `none<number>()` → `none`. `none` is a singleton, not a
  factory. Calling it as a function was invented by the author
  and never existed.
- Removed the unused `unit` import; the snippet does not use it.
- Reordered the imports for clarity (Result first, Maybe
  second).

**Fixed in `features-grid.tsx`**

- "Optional values" tile: `.getWithDefault()` → `.getOrElse()`.
  `getWithDefault` is not a method on `Maybe`; the public API
  exposes `getOrElse`, `getOrThrow`, `getOrNull`,
  `getOrUndefined`.
- "Pipe match → map" tile: replaced the broken example (which
  called `.map` on the return value of `.match`, which is a
  plain `U`, not a `Result`) with a `flatMap` chain that
  compiles and demonstrates the actual shape of the API.
- "Unit" tile description: dropped "Side effects visible in
  the signature" (Unit is a value for cases that must return
  something but have no result; it does not advertise side
  effects).

**Fixed in `code-comparison.tsx`**

- "Optional values" comparison: `none()` → `none`,
  `.getWithDefault()` → `.getOrElse()`, `.forEach()` →
  `.match({ some, none })`. The Maybe pipeable API does not
  include `forEach`.
- "Side effects" comparison: rewritten so both versions do the
  same work (one `localStorage.setItem` call each). The
  previous version mutated module-level state in the
  JavaScript side and removed the mutation in the FP side,
  so the two snippets were not doing the same thing.
- The "Error handling" and "Validation" comparisons were
  already correct against the public API. They are left
  unchanged.

**What is intentionally still TODO**

- Long-term, the snippets should live in `apps/web/content/
  examples/*.ts` so they can be type-checked by the project
  compiler rather than verified by hand. That is a separate
  refactor (the marketing components would need to import
  from there).
- A test or build step that compiles every snippet against
  the published package would close the loop. Out of scope
  for this commit.

**Validation**

- `pnpm --filter web type-check` clean.
- `pnpm --filter web lint` clean (only pre-existing warnings
  in other files).
- `pnpm --filter web build` clean (25 pages).
- Manual cross-check of every snippet against
  `packages/fp/src/index.ts` (public exports) and the
  pipeable function signatures in
  `packages/fp/src/result/functions.ts` and
  `packages/fp/src/maybe/functions.ts`.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
