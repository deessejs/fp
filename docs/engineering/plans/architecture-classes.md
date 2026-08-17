# Architecture classes

**Status**: Implemented (PR #TBD).
**Date**: 2026-08-17.
**Branch**: `architecture/classes`.

## Goal

Replace the plain-object + closure factories currently used by `Result` and `Maybe` with internal classes (`OkImpl`, `ErrImpl`, `SomeImpl`, `NoneImpl`) hidden behind the public factory functions. The public API surface stays byte-for-byte identical; the internal implementation gains type inference, removes a class of chained casts, and aligns with the patterns spelled out in rule 0014 ("Functions Over Classes for Public API").

In the same PR, deliver the pipeable functions that the `TODO` comments in `result/index.ts` and `maybe/index.ts` have been signalling since v1.0.

## Decisions

1. **Public surface is unchanged.** `ok`, `err`, `some`, `none`, `maybe`, `Unit`, `isResult`, `isMaybe`, `isUnit`, and the type names (`Ok`, `Err`, `Result`, `Some`, `None`, `Maybe`, `Unit`, `OkType`, `ErrType`, `SomeType`) keep their signatures and exported names. No new exports are *required* by this refactor; the pipeables are additive.
2. **Classes are internal.** `OkImpl`, `ErrImpl`, `SomeImpl`, `NoneImpl` live in `result/internal/` and `maybe/internal/` respectively. They are not re-exported. Per rule 0014, the only public construction point is the factory function.
3. **Type aliases over `interface`.** Per rule 0012, the public types are `type Ok<T,E> = OkImpl<T,E>` (and equivalents). The former `interface` declarations become type aliases pointing at the class. This removes the ambiguity of the rule 0012 exception list: classes are the open shape; `type` is the public contract.
4. **Private fields via `#`.** State is stored in `#value` / `#error` (or equivalent) using ECMAScript private fields. No `readonly` placeholder, no `private` TS keyword that compiles to public. Rule 0014 asks for true encapsulation; `#` delivers it.
5. **`none` is a static singleton.** `NoneImpl.NONE` is a single instance; `none` exports it. Mirrors the current behaviour with the same identity guarantees (`some(10) === some(10)` is intentionally false; `none === none` is true).
6. **Discrimination via `_tag` field.** The `_tag` field is public on the class instances (because `_tag` is part of the public type contract — `isResult` and `isMaybe` rely on it). Consumers inspect `_tag` for their own guards; the class does not expose `instanceof` checks.
7. **No `as unknown as ...` in the implementation.** The previous `constants.ts` relied on chained casts (rule 0008 violation) to convince the compiler that `return this` inside an `Ok` literal was typed as `Ok<T,E>`. Classes infer `this` correctly. The refactor removes every chained cast inside the refactored modules.
8. **Pipeables are pure functions.** Each pipeable is a function from a value to a function of the operation: `map<B>(fn: (value: T) => B): (result: Result<T,E>) => Result<B,E>`. They compose through `pipe`. They do not capture `this`.
9. **Unit is untouched.** `Unit` is a one-property singleton. Converting it to a class is ceremony without value. The rule of three (rule 0001, invariant 4) does not apply.

## File map

```
packages/fp/src/
├── index.ts                          # unchanged barrel (no new public exports outside pipeables)
├── types.ts                          # unchanged
├── result/
│   ├── types.ts                      # Ok/Err/Result as type aliases to OkImpl/ErrImpl
│   ├── constants.ts                  # ok()/err() factories use the internal classes
│   ├── internal/
│   │   ├── ok-impl.ts                # OkImpl class (not exported)
│   │   └── err-impl.ts               # ErrImpl class (not exported)
│   ├── functions.ts                  # NEW — pipeable map, flatMap, mapError, ...
│   └── index.ts                      # re-exports types, factories, AND pipeables
├── maybe/
│   ├── types.ts                      # Some/None/Maybe as type aliases
│   ├── constants.ts                  # some()/none()/maybe() factories
│   ├── internal/
│   │   ├── some-impl.ts              # SomeImpl class (not exported)
│   │   └── none-impl.ts              # NoneImpl class with NONE singleton
│   ├── functions.ts                  # NEW — pipeable map, flatMap, filter, ...
│   └── index.ts                      # re-exports types, factories, AND pipeables
└── unit/                             # unchanged
```

## Out of scope

- Behaviour changes. Every public method keeps its current semantics.
- Test changes. `tests/index.test.ts` exercises the public API and should pass without edits.
- Documentation site (`apps/web/`). Doc updates land in a follow-up PR.
- `Try`, `pipe`, `flow`, `AsyncResult`, `Queue`, `Sequence`, `Collection`, `gen`. These are not in the current `src/`. If they exist in feature branches, they are merged independently.

## Rollout

- Single PR, single changeset.
- Changeset: `minor` if pipeables are considered a new feature; `patch` if we treat them as completion of an existing TODO. Proposal: `minor` (new exports).
- After merge to `staging`, the next release will exercise the new internal classes via the existing smoke test before publishing.
