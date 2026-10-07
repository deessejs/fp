/**
 * `poll` — run a handler repeatedly until it resolves, with
 * optional backoff and stop conditions. Returns a {@link Result} of
 * the final state.
 *
 * The handler is called once per attempt. It receives the current
 * state and returns a {@link Poll} outcome:
 *
 * - `pending` — sleep for the current interval, then call `handler`
 *   again. If a `backoff` function is configured, the new interval
 *   is computed from the state.
 * - `done` — return `Result.ok(value)`. Done.
 * - `failed` — return `Result.err(error)`. Done.
 *
 * If `until` is supplied and returns `true` after a `pending`, the
 * current state is returned wrapped as `done` (this is the "give up
 * gracefully with the last known state" path).
 *
 * If `maxAttempts` is supplied and reached, the runner returns
 * `Result.err(exhausted(state, attempts))`.
 *
 * Exceptions thrown by `handler` propagate to the caller. The runner
 * does not catch them — `handler` is expected to return a `failed`
 * outcome rather than throw, which keeps error handling declarative.
 *
 * The argument is a single {@link PollConfig} object: initial state,
 * handler, and loop options at the same level, named. This is the
 * replacement for the earlier positional signature
 * `poll(initial, step, options)`; the latter is a hard break.
 *
 * @example
 * const tokens = await poll({
 *   initial: { code, attempts: 0, interval: 5_000 },
 *   handler: async (state) => {
 *     const response = await authClient.device.token({ current: state.code });
 *     if ('access_token' in response) return done({ ...state, tokens: response });
 *     if (response.error === 'authorization_pending') return pending(state);
 *     if (response.error === 'slow_down') {
 *       return pending({ ...state, interval: state.interval + 5_000 });
 *     }
 *     return failed(new CliError('device_flow_error', response.error));
 *   },
 *   interval: 5_000,
 *   backoff: (state) => Math.min(state.interval * 2, 60_000),
 *   maxAttempts: 60,
 *   exhausted: (state, attempts) =>
 *     new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
 * });
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from '../result/constants.js';
import type { Result } from '../result/types.js';
import { sleep } from './internal/sleep.js';
import type { PollConfig } from './types.js';

/**
 * Run `handler` repeatedly until it resolves, fails, or hits a stop
 * condition. The single argument is a {@link PollConfig} bundling the
 * initial state, the handler, and the loop options.
 */
export function poll<S, E>(config: PollConfig<S, E>): Promise<Result<S, E>> {
  return runPoll(config);
}

async function runPoll<S, E>(config: PollConfig<S, E>): Promise<Result<S, E>> {
  // Pre-flight check: maxAttempts requires an exhausted factory. Done
  // before the destructure so the rest of the function can rely on
  // the invariant.
  if (config.maxAttempts !== undefined && config.exhausted === undefined) {
    throw new Error('poll: maxAttempts is set but exhausted factory is not provided');
  }

  const { initial, handler, interval: initialInterval, backoff, until, maxAttempts } = config;
  // Bind `exhausted` to a local const so TypeScript narrows it after
  // the entry check. The invariant is enforced above; the local
  // binding is what makes the in-loop call type-check.
  const exhausted = config.exhausted as Exclude<typeof config.exhausted, undefined>;

  let state: S = initial;
  let interval = initialInterval;
  let attempts = 0;

  // The awaits below are intentional: this is a sequential poll loop, not
  // a parallel batch. Each iteration depends on the previous outcome
  // (state + interval) and a `sleep` between them. Running them in
  // parallel would defeat the entire purpose of polling.
  /* eslint-disable no-await-in-loop */
  for (;;) {
    attempts += 1;
    const outcome = await handler(state);

    switch (outcome._tag) {
      case 'Done':
        return ok(outcome.value);

      case 'Failed':
        return err(outcome.error);

      case 'Pending': {
        state = outcome.state;

        if (until?.(state) === true) {
          return ok(state);
        }

        if (maxAttempts !== undefined && attempts >= maxAttempts) {
          // `exhausted` is bound at function entry after the pre-flight
          // check. It is guaranteed to be defined here. No runtime
          // re-check is needed.
          return err(exhausted(state, attempts));
        }

        await sleep(interval);
        if (backoff !== undefined) {
          interval = backoff(state);
        }
        continue;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
}
