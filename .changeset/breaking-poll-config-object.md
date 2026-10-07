---
"@deessejs/fp": major
---

breaking(fp): `poll` now takes a single config object

`poll(initial, step, options)` is replaced by `poll({ initial, handler, ...options })`. The handler argument is renamed from `step` to `handler` because that is what the function does. The change is a hard break; no alias or deprecation path is provided because the previous API was unreleased.

Before:

```ts
const tokens = await poll<State, CliError>(
  { code, attempts: 0, interval: 5_000 },
  async (state) => { /* step */ },
  {
    interval: 5_000,
    backoff: (state) => Math.min(state.interval * 2, 60_000),
    maxAttempts: 60,
    exhausted: (state, attempts) => new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
  }
);
```

After:

```ts
const tokens = await poll<State, CliError>({
  initial: { code, attempts: 0, interval: 5_000 },
  handler: async (state) => { /* handler */ },
  interval: 5_000,
  backoff: (state) => Math.min(state.interval * 2, 60_000),
  maxAttempts: 60,
  exhausted: (state, attempts) => new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
});
```

Why a single config object: the call site reads as one block instead of three positional arguments, the names (`initial`, `handler`) are explicit instead of positional, and the loop options sit at the same level as the state and handler rather than nested inside a third argument that suggests a lower-tier "advanced options" group. The `handler` rename matches the standard convention (`onClick`, `onChange`, etc.) for functions that handle an event or iteration.

Type changes:

- `PollConfig<S, E>` exported as a public type. It extends `PollOptions<S, E>` with `initial: S` and `handler: (state: S) => Promise<Poll<S, E>>`.
- `PollOptions<S, E>` itself is unchanged.
- The `step` name is gone; use `handler`.

No new runtime dependencies. Tests stay at 100% coverage. The breaking change ships together with the original `poll` feature in this release series; no published artifact has ever used the old signature.

Migrating: replace any existing `poll(initial, step, options)` call with `poll({ initial, handler: step, ...options })` and update the call signature accordingly. There is no automated codemod because the surface has not been published yet.
