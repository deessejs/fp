---
'@deessejs/fp': minor
---

feat(fp): add function utilities (pipe, flow, identity, constant, flip, tupled, untupled)

Delivers the function utilities that the documentation has been
promising since v1.0 (see `docs/internal/product/features/function-utilities.md`).

- `pipe` — left-to-right function composition with a starting value.
- `flow` — left-to-right function composition that returns a function.
- `identity` — the identity function.
- `constant` — wraps a value into a function that ignores its argument.
- `flip` — swaps the first two arguments of a binary function.
- `tupled` / `untupled` — tuple ↔ positional adapters.

`pipe` and `flow` carry variadic overloads up to nine steps. Beyond
that the tail collapses to `unknown` and the caller is on their own.

These are the seven exports that the README and the documentation
have been advertising. The pipeables shipped in PR #431 (`map`,
`flatMap`, ...) are now usable through `pipe` as the JSDoc in
`result/functions.ts` and `maybe/functions.ts` already documents.

See `docs/engineering/plans/function-utilities.md`.
