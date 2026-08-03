# @deessejs/fp — Functional Programming Utilities

A lightweight TypeScript library of functional programming primitives. Designed to be simple, composable, and dependency-free.

## Philosophy

> **Simple by default.** No over-engineering, no fancy type gymnastics. Just the primitives you need to write cleaner code.

This library is the core of an ecosystem — intentionally minimal, fast to learn, and easy to extend.

## Quick Start

```typescript
import { Result, ok, err, pipe } from '@deessejs/fp';

// Result: represent values that may have failed
const divide = (a: number, b: number): Result<number, string> =>
  b === 0 ? err('Division by zero') : ok(a / 2);

// Maybe: represent optional values
const findUser = (id: string): Maybe<User> => db.get(id);

// Chain operations
const result = pipe(
  ok(5),
  Result.map(n => n * 2),
  Result.flatMap(n => n > 10 ? ok(n) : err('too small')),
);
```

## Features

### Core Primitives

- **[Result](features/result.md)** — `Ok | Err` pattern for type-safe error handling
- **[Maybe](features/maybe.md)** — `Some | None` pattern for optional values
- **[Try](features/try.md)** — Wrap sync/async operations that may throw
- **[Unit](features/unit.md)** — The unit type for void-returning functions

### Function Utilities

- **[Function Utilities](features/function-utilities.md)** — `pipe`, `flow`, `identity`, `constant`, `flip`, `tupled`

### Async Utilities

- **[Async Utilities](features/async-utilities.md)** — `sleep`, `retry`, `timeout`, `Queue`

### Predicate Utilities

- **[Predicate Utilities](features/predicate-utilities.md)** — `Predicate`, `Refinement`, `not`, `and`, `or`

### Collection Types

- **[Collection Types](features/collection-types.md)** — `Context`, `Sequence`, `Collection`, AsyncIterator utils

### Advanced

- **[Generator Composition](features/generator-composition.md)** — `gen()` with `yield*` for clean async flows
- **[Serialization](features/serialization.md)** — `serialize`/`deserialize` for RPC

### Ecosystem

- **[Ecosystem Integration](features/ecosystem-integration.md)** — First-class `@deessejs/errors` support

## Installation

```bash
npm install @deessejs/fp
```

## License

MIT

<!-- dummy-release-test: marker for e2e release pipeline validation -->
