# Wrapping Throwing Functions

The Try abstraction — a value that models a computation which may
throw — is **not** a separate type in `@deessejs/fp`. It is the
`Result<T, E>` type with a constructor that catches exceptions.

Use [`Result.fromThrowable`](./result.md#fromthrowable) for sync
wraps and [`Result.fromAsyncThrowable`](./result.md#fromasyncthrowable)
for async wraps. The legacy top-level names `try_` and `tryPromise`
are kept as aliases of those factories.

## Quick start

```typescript
import {
  ok, err, map, getOrElse,
  fromThrowable, fromAsyncThrowable,
} from '@deessejs/fp';

// Sync: any thrown value becomes Err
const r1 = fromThrowable(() => JSON.parse(raw));
// r1: Result<unknown, UnhandledException>

// Sync with mapper: thrown value is mapped through onError
const r2 = fromThrowable<Config, Error>({
  onSuccess: () => readConfigSync(path),
  onError: (e) => e instanceof Error ? e : new Error(String(e)),
});
// r2: Result<Config, Error>

// Async: a rejected Promise becomes Err
const r3 = await fromAsyncThrowable(() => fetch(url).then((res) => res.json()));
// r3: Result<unknown, UnhandledException>
```

## The legacy `try_` and `tryPromise` aliases

```typescript
import { try_, tryPromise } from '@deessejs/fp';

// These are aliases of fromThrowable / fromAsyncThrowable.
const r = try_<number>(() => 10);
// r: Result<number, UnhandledException>

const r2 = await tryPromise<Config, Error>({
  onSuccess: () => fetchConfig(),
  onError: (e) => e instanceof Error ? e : new Error(String(e)),
});
// r2: Result<Config, Error>
```

Both forms support two overloads: a thunk-only form and the
`{ onSuccess, onError }` object form. See [`Result.fromThrowable`](./result.md#fromthrowable)
for the full reference.

## Composition

Because the output is a `Result`, every `Result` pipeable works on
it directly — no `toResultTry()` bridge needed.

```typescript
import { pipe, map, getOrElse, fromAsyncThrowable } from '@deessejs/fp';

const templateCount = await pipe(
  fromAsyncThrowable(() => orpc.templates.list(undefined, cache)),
  map((list) => list.templates.length),
  getOrElse(0),
);
// templateCount: number
```

## Advanced helpers

- [`attempt`](./result.md#attempt) — a lazy wrapper that exposes
  `{ execute(), clientSafe() }` for retry, normalisation, and
  client-safe error mapping.
- [`withReporting`](./result.md#withreporting) — wraps an operation
  and forwards caught errors to a caller-supplied
  [`ErrorReporter`](./result.md#errorreporter).
- [`classifyError`](./result.md#classifyerror) — matches a thrown
  value against a list of `Error` constructors and returns
  `'retryable' | 'non-retryable'`.

## Why one type, not two

`Success<T,E>` and `Ok<T,E>` are the same machine of states under
two names. Maintaining both meant duplicate pipeables (`map` /
`mapTry`), duplicate type guards (`isOk` / `isSuccess`), and a
bridge function (`toResultTry`). Unifying on `Result` keeps one
naming convention, one set of combinators, one discriminated union
to reason about. The wrapped-throwing case is just `Result` with a
catch — the same way Promise rejection is just `Promise` with
`reject`.
