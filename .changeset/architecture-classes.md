---
'@deessejs/fp': minor
---

refactor(fp): replace plain-object Result/Maybe with internal classes behind the public factory functions

The public API is unchanged. `Ok`, `Err`, `Some`, `None`, `Result`, and `Maybe` are now `type` aliases pointing at internal `OkImpl`, `ErrImpl`, `SomeImpl`, and `NoneImpl` classes. The classes are not exported; the factory functions (`ok`, `err`, `some`, `none`, `maybe`) remain the only public construction entry points.

Chained type assertions on the previous implementations are gone. `none` is a single static instance.

Also delivers the pipeable functions that the `TODO` comments in `result/index.ts` and `maybe/index.ts` have been signalling since v1.0: `map`, `flatMap`, `mapError`, `filter`, `tap`, `tapAsync`, `flatMapAsync`, `match`, `fold`, `getOrElse`, `getOrThrow`, `getOrNull`, `getOrUndefined`, `toMaybe`, `toResult`, `toArray`, `toIterable`, `isOk`, `isErr`, `isSome`, `isNone` — and the `get` projection for `Maybe`. They compose through `pipe`.

See `docs/engineering/plans/architecture-classes.md`.
