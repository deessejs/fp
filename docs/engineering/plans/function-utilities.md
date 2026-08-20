# Function utilities

**Status**: Implemented (PR #TBD).
**Date**: 2026-08-17.
**Branch**: `function/pipe-and-friends`.

## Goal

Deliver the function utilities that the documentation has been promising since v1.0 but the code has never shipped:

- `pipe` — left-to-right function composition with a starting value.
- `flow` — left-to-right function composition that returns a function.
- `identity` — the identity function.
- `constant` — wraps a value into a function that ignores its argument.
- `flip` — swaps the first two arguments of a binary function.
- `tupled` — converts a function whose first argument is a tuple into a function that takes the tuple.
- `untupled` — inverse of `tupled`.

These are the seven exports announced in `docs/internal/product/features/function-utilities.md` and in the top-level `README.md`.

## Decisions

1. **ESM-only, package-local.** The module lives at `packages/fp/src/function/`. No runtime dependencies. Pure functions, no state.
2. **Variadic overloads, not arrays.** `pipe(...args)` and `flow(...fns)` accept up to nine steps. Beyond that, the type system widens to `Function`-equivalent and the caller is on their own — this matches the spec in `function-utilities.md`.
3. **`identity` and `constant` are arrow functions, not classes.** Rule 0014 — classes are not exports. Style preference: arrow functions because they show the closure more clearly for these trivially-sized functions.
4. **`flip` works on two-arg functions only.** Three+ argument `flip` is a different shape (permutation); out of scope. Documented in JSDoc.
5. **`tupled` / `untupled` are inverses.** `untupled(tupled(f))` returns the same function shape as `f`. Tests assert both directions.
6. **No `any`.** All overloads are typed. The variadic tail collapses to `(...args: unknown[]) => unknown` only when the call site widens — the supplied overloads cover the documented arities (1-9).
7. **The new exports do not collide with the existing pipeables.** The barrel already disambiguates Maybe/Result pipeables by suffixing. The function utilities (`pipe`, `flow`, `identity`, `constant`, `flip`, `tupled`, `untupled`) keep their bare names because none of them clash with a `Result` or `Maybe` export.

## File map

```
packages/fp/src/
├── function/
│   ├── pipe.ts
│   ├── flow.ts
│   ├── identity.ts
│   ├── constant.ts
│   ├── flip.ts
│   ├── tupled.ts
│   ├── untupled.ts
│   └── index.ts          # re-exports the seven functions
└── index.ts              # extends the public barrel
```

## Out of scope

- `gen()` — generator composition. Larger feature, separate PR.
- `Try`, `sleep`, `retry`, `timeout`, `Queue`, `Predicate`, `Refinement`, `Context`, `Sequence`, `Collection` — listed in the README but unimplemented. Out of scope for this PR.
- `pipeAsync` — async pipeline variant. Can be a follow-up.

## Rollout

- Single PR, single changeset.
- Changeset: `minor` (new public exports).
- After merge to staging, the next release will surface the new exports via the existing smoke test.
