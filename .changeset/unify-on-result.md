---
'@deessejs/fp': minor
---

refactor(fp): unify error handling on `Result`, retire the `Try` type

The previous Try module is gone. `Success<T,E>` / `Failure<T,E>` /
`Try<T,E>` / `UnhandledException` are no longer public types. The
underlying reasoning is `Result<T,E>` end-to-end — there is one
machine of states, one set of pipeables (`map`, `flatMap`,
`mapError`, `match`, `getOrElse`, …), one vocabulary.

What stays at the top level:

- `Result.fromThrowable` and `Result.fromAsyncThrowable` — the
  canonical entry points for wrapping throwing functions. Both
  support two overloads (thunk-only and `{ onSuccess, onError }`)
  and return `Result<T, E>` directly.
- `try_` and `tryPromise` — kept as aliases of `fromThrowable` and
  `fromAsyncThrowable` so consumers who already imported them from
  `@deessejs/fp` keep working unchanged. They now produce `Result`,
  not `Try`.
- `attempt`, `withReporting`, `classifyError` — moved into
  `result/` and unchanged in shape.

The 15 `*Try` pipeable aliases (`mapTry`, `flatMapTry`,
`matchTry`, `isSuccess`, `isFailure`, …) are removed. Use the
unprefixed `Result` pipeables directly.

Coverage 100% on lines / branches / functions / statements across
the consolidated surface.

See `docs/internal/product/features/result.md` for the canonical
documentation.
