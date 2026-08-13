# 0001 — `@deessejs/fp` Package Position

**Status**: Accepted.
**Date**: 2026-08-13.

## Context

`@deessejs/fp` was created as the foundational functional-programming library for the `@deessejs/*` ecosystem. It currently ships `Result<T,E>`, `Maybe<T>`, and `Unit` plus type-level extractors (`OkType`, `ErrType`, `SomeType`) and runtime guards (`isResult`, `isMaybe`, `isUnit`). It is consumed by the docs site (`apps/web`) and is a candidate consumer of `@deessejs/errors` once `try_` / `fromThrowable` are added.

This ADR enumerates the deliberate technology choices the package commits to, using the four-question template from rule 0006.

## Decisions

### 1. ESM-only

- **What**: TypeScript compiled to `.js` with `.d.ts` declarations. No CommonJS shim, no `module: "commonjs"`, no dynamic `require` from the published surface.
- **Enables**: Tree-shaking, top-level await for consumers, exact types from the package source.
- **Rules out**: Consumers on CommonJS resolvers cannot use this package without dynamic `import()` or a build step. Acceptable: the alternative (a CJS shim) would double the surface area.
- **Revisit when**: Node.js ends ESM-only support (not announced), or a downstream pattern shows the exclusion is becoming a tax.

### 2. TypeScript strict mode

- **What**: `"strict": true` plus the no-implicit-`any` + no-unchecked-index-access discipline in `tsconfig.json`.
- **Enables**: The compiler is the first reviewer of every PR. No silent null drift, no unchecked-key access.
- **Rules out**: Legacy untyped JS imports without an explicit `.d.ts` boundary. Acceptable: a separate `@types/*` shim is the right shape when truly needed.
- **Revisit when**: Strict mode itself is deprecated (not planned).

### 3. Function-based public API

- **What**: Constructors (`ok`, `err`, `some`, `none`, `maybe`, `unit`) and instance methods on the discriminated-union values are the public shape. No classes are exported.
- **Enables**: Composable without inheritance. Consumers cannot accidentally couple to a class identity. Matches rule 0014.
- **Rules out**: `instanceof Some` style narrowing against the concrete implementation. Acceptable: the discriminated-union `_tag` narrowing works structurally.
- **Revisit when**: Stateful primitives (e.g. `Stack<T>` with `push` / `pop` / `peek`) become a first-class export. When that day comes, the internal class is exposed via factory function (`createStack`) and the public type.

### 4. Discriminated unions, not classes, for runtime values

- **What**: `Result<T,E> = Ok<T,E> | Err<T,E>` and `Maybe<T> = Some<T> | None` are object literals with a `_tag` discriminator. Plain object literals, not classes.
- **Enables**: Without classes, structural compatibility with plain object mocks is automatic and the package ships no `instanceof` surprises. Patterns like `Result<T,E>` extensibility come from adding fields, not subclassing.
- **Rules out**: A class-based seal that would make `instanceof` useful. Acceptable: rule 0014 forbids exporting classes anyway.
- **Revisit when**: A future primitive (e.g. `AsyncResult<T,E>` with state) needs encapsulation that object literals cannot provide cleanly. Then internal classes reappear, behind a factory function.

### 5. Dependency minimalism

- **What**: No runtime dependencies. `peerDependencies` is empty. `devDependencies` is restricted to eslint/typescript/vitest.
- **Enables**: Smaller install footprint, no transitive surprises, no release-cadence coupling.
- **Rules out**: A drop-in runtime feature like Standard Schema validation. Acceptable: a future PR that wants to add Standard Schema would write its own ADR justifying the addition per rule 0006.
- **Revisit when**: `@deessejs/errors` becomes a real consumer of `@deessejs/fp` (the `try_` family will use `Result<T,E>` internally) — at that point, declare it in `peerDependencies` with a `peerDependenciesMeta.optional = true` so users without `@deessejs/errors` can still use the core.

### 6. Honest runtime (no transpilation tricks)

- **What**: No `@ts-ignore`, no `@ts-expect-error` in shipped source. No transpilation that hides the runtime target.
- **Enables**: The code that ships is the code that runs. Errors are debuggable. No "works on my machine, fails in CI" surprises.
- **Rules out**: Shortcuts that bypass the type system. Acceptable: rule 0001 invariants 1, 7 forbid this anyway.
- **Revisit when**: never — this is a non-negotiable baseline.

### 7. Filesystem-mandated names only

- **What**: All filenames are kebab-case (rule 0011). `index.ts` and tool-mandated names (`tsconfig*.json`, `.changeset/*.md`) are exempt per the rule.
- **Enables**: Cross-platform case-insensitive filesystems stay unambiguous. One grep, one casing.
- **Rules out**: any file named in `camelCase`, `PascalCase`, or `snake_case`.
- **Revisit when**: never — this is a non-negotiable baseline.

## Consequences

- **Easier**: review, onboarding, dropping consumption into other `@deessejs/*` packages, future class-based primitives behind factory functions.
- **Harder**: implementing patterns that other libraries express with `instanceof` (e.g. visitor double-dispatch on sealed class hierarchies). Replaced here with `_tag` narrowing.

## Supersedes

None.

## See also

- [`../rules/0006-technology-choices.md`](../rules/0006-technology-choices.md)
- [`../rules/0014-functions-over-classes-for-public-api.md`](../rules/0014-functions-over-classes-for-public-api.md)
- [`../rules/0011-filename-kebab-case.md`](../rules/0011-filename-kebab-case.md)
