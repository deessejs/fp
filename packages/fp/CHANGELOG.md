# @deessejs/fp

## 1.0.2

### Patch Changes

- 301857b: Dummy e2e test of the release pipeline. No code or API change — only a documentation marker added to validate the Trusted Publishing path end-to-end. This entry can be reverted once the test is complete.

## 1.0.1

### Patch Changes

- 79fee31: Fix: emit explicit `.js` extensions on relative imports in the published `dist/` so Node ESM consumers (strict mode) can resolve them. This unblocks Vitest and other test runners that don't bundle on import.

  Switches `packages/fp/tsconfig.json` to `module: NodeNext` + `moduleResolution: NodeNext` and updates source-level relative imports to include the `.js` suffix, as recommended by the TypeScript team for dual ESM/CJS packages.

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
