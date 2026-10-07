---
'@deessejs/fp': minor
---

feat(fp): add `poll` helper for iterative async processes

Adds a small ADT for the "ask again later" pattern — useful for OAuth device flow, retry-until-ready loops, and similar iterative processes that need to discriminate between a successful resolution, a recoverable "keep going" outcome, and a final failure.

Exports:

- `Poll<S, E>` — discriminated union with three branches: `Pending<S>`, `Done<S>`, `Failed<E>`.
- `PollOptions<S, E>` — `{ interval, backoff?, until?, maxAttempts?, exhausted? }` for tuning the loop.
- `pending(state)`, `done(value)`, `failed(error)` — constructors for the three branches.
- `poll(initial, step, options)` and the curried `poll(initial)(step)(options)` form. The runner loops, applies backoff between attempts, stops on `until` satisfaction, and fails with `exhausted(state, attempts)` when `maxAttempts` is reached.

Returns `Result<S, E>`. The `Pending` branch is consumed by the loop and never reaches the caller; what reaches the caller is either a successful state or a final error.

The runner does not catch exceptions thrown by `step` — a step that throws is treated as a programmer error and propagated. The convention is that `step` returns `failed(error)` rather than throwing, which keeps error handling declarative.

This is intentionally narrower than a full `Either<L, R>` type. It targets one specific shape of iterative process; it does not aim to be a general-purpose sum type. If a future use case needs a proper `Either` or a `TaskEither`, that can be added separately without replacing this helper.

No runtime dependencies added. The implementation is one file plus a `setTimeout`-based `sleep` helper, ~140 lines including types and JSDoc.
