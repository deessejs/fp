# @deessejs/fp

## 1.0.0

### Minor Changes

- c18a652: Release v1.0.0-alpha.1 - Core Types

  ### Minor Changes

  - Add `Result<T, E>` type with `Ok` and `Err` variants
  - Add `Maybe<T>` type with `Some` and `None` variants
  - Add `Unit` type for void-returning functions
  - Add constructors: `ok()`, `err()`, `some()`, `none()`, `maybe()`, `unit`
  - Add instance methods: `map`, `flatMap`, `filter`, `tap`, `fold`, `getOrElse`, `mapError`
  - Add type guards: `isOk`, `isErr`, `isSome`, `isNone`, `isUnit`
  - Add type utilities: `isResult`, `isMaybe`, `OkType`, `ErrType`, `SomeType`
