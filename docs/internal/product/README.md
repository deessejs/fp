# @deessejs/fp - Functional Programming Utilities

A lightweight TypeScript library of functional programming primitives. Designed to be simple, composable, and dependency-free.

## Philosophy

> **Simple by default.** No over-engineering, no fancy type gymnastics. Just the primitives you need to write cleaner code.

This library is the core of an ecosystem - intentionally minimal, fast to learn, and easy to extend.

## Quick Start

```typescript
import { Result, ok, err, pipe, fromThrowable, attempt } from "@deessejs/fp";

// Result: represent values that may have failed
const divide = (a: number, b: number): Result<number, string> =>
  b === 0 ? err("Division by zero") : ok(a / b);

// Wrap a throwing function
const readFile = fromThrowable({
  onSuccess: () => fs.readFileSync("config.json", "utf-8"),
  onError: (e) => (e instanceof Error ? e : new Error(String(e))),
});
```

## Features

### Core Primitives

- **[Result](features/result.md)** - `Ok | Err` pattern for type-safe error handling, including wrapping throwing functions
- **[Maybe](features/maybe.md)** - `Some | None` pattern for optional values
- **[Unit](features/unit.md)** - The unit type for void-returning operations

### Function Utilities

- **[Function Utilities](features/function-utilities.md)** - `pipe`, `flow`, `identity`, `constant`, `flip`

### Async Utilities

- **[Async Utilities](features/async-utilities.md)** - `sleep`, `retry`, `timeout`, `Queue`

### Predicate Utilities

- **[Predicate Utilities](features/predicate-utilities.md)** - `Predicate`, `Refinement`, `not`, `and`, `or`

### Collection Types

- **[Collection Types](features/collection-types.md)** - `Context`, `Sequence`, `Collection`, AsyncIterator utils

### Advanced

- **[Generator Composition](features/generator-composition.md)** - `gen()` with `yield*` for clean async flows
- **[Serialization](features/serialization.md)** - `serialize`/`deserialize` for RPC

### Ecosystem

- **[Ecosystem Integration](features/ecosystem-integration.md)** - First-class `@deessejs/errors` support

## Installation

```bash
npm install @deessejs/fp
```

## License

MIT

<!-- dummy-release-test: marker for e2e release pipeline validation -->
