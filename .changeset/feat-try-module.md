---
'@deessejs/fp': minor
---

feat(fp): add Try module (try_, tryPromise, attempt, withReporting, classifyError)

Delivers the `Try<T, E>` module that the README and
`docs/internal/product/features/try.md` have been advertising since
v1.0. Wraps synchronous and asynchronous throwing functions into a
typed value, eliminating silent `try`/`catch` blocks at call sites.

- `try_<T>(thunk)` and `try_<T, E>({ onSuccess, onError })` — sync
  wrap, with or without an explicit error mapper.
- `tryPromise<T>(thunk)` and `tryPromise<T, E>({ onSuccess, onError })`
  — async wrap. `onError` may itself be async.
- `attempt(config)` — returns `{ execute(), clientSafe() }` for
  callers that want a `Result` directly with optional client-safe
  error normalization.
- `withReporting(onSuccess, name, reporter, metadata?)` — forwards
  caught errors to a caller-supplied `ErrorReporter` and returns a
  `Result<T, ReportableError>`.
- `classifyError(e, rules)` — returns `'retryable' | 'non-retryable'`
  based on `instanceof` matching against a rule list.
- `toResultTry()` — converts a `Try<T, E>` into a `Result<T, E>` so
  existing `pipe(... , map, getOrElse)` pipelines compose naturally.

Internal classes `SuccessImpl` / `FailureImpl` follow rule 0014 and
live in `src/try/internal/`; the public types are `type` aliases
pointing at them (rule 0012). The discriminated union uses
`_tag: 'Success' | 'Failure'` to mirror the existing
`Ok`/`Err` and `Some`/`None` naming.

See `docs/internal/product/features/try.md` for the rewritten
documentation that matches the shipped surface. Single-attempt retry
inside `attempt` and the `DelayStrategy` / `RetryConfig` types ship
for forward compatibility; the `retry` / `exponential` / `constant` /
`linear` helpers are out of scope for this PR.
