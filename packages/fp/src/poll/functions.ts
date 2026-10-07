/**
 * `poll` — run a step function repeatedly until it resolves, with
 * optional backoff and stop conditions. Returns a {@link Result} of
 * the final state.
 *
 * The step function is called once per attempt. It receives the
 * current state and returns a {@link Poll} outcome:
 *
 * - `pending` — sleep for the current interval, then call `step` again.
 *   If a `backoff` function is configured, the new interval is computed
 *   from the state.
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
 * Exceptions thrown by `step` propagate to the caller. The runner does
 * not catch them — `step` is expected to return a `failed` outcome
 * rather than throw, which keeps error handling declarative.
 *
 * @example
 * const tokens = await poll(
 *   { code, interval: 5_000, attempts: 0 },
 *   async (state) => {
 *     const response = await authClient.device.token({ current: state.code });
 *     if ('access_token' in response) return done({ ...state, tokens: response });
 *     if (response.error === 'authorization_pending') return pending(state);
 *     if (response.error === 'slow_down') {
 *       return pending({ ...state, interval: state.interval + 5_000 });
 *     }
 *     return failed(new CliError('device_flow_error', response.error));
 *   },
 *   {
 *     interval: 5_000,
 *     backoff: (state) => Math.min(state.interval * 2, 60_000),
 *     maxAttempts: 60,
 *     exhausted: (state, attempts) =>
 *       new CliError('device_flow_timeout', `gave up after ${attempts} attempts`),
 *   }
 * );
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from '../result/constants.js';
import type { Result } from '../result/types.js';
import { sleep } from './internal/sleep.js';
import type { Poll, PollOptions } from './types.js';

/**
 * Run `step` repeatedly until it resolves, fails, or hits a stop
 * condition. The function is curried: `poll(initial)(step)(options)`
 * or `poll(initial, step, options)`. The two- and three-argument
 * overloads are equivalent.
 */
export function poll<S, E>(
  initial: S,
  step: (state: S) => Promise<Poll<S, E>>,
  options: PollOptions<S, E>
): Promise<Result<S, E>>;
export function poll<S, E>(
  initial: S
): (
  step: (state: S) => Promise<Poll<S, E>>
) => (options: PollOptions<S, E>) => Promise<Result<S, E>>;
export function poll<S, E>(
  initial: S,
  step?: (state: S) => Promise<Poll<S, E>>,
  options?: PollOptions<S, E>
):
  | Promise<Result<S, E>>
  | ((
      step: (state: S) => Promise<Poll<S, E>>
    ) => (options: PollOptions<S, E>) => Promise<Result<S, E>>) {
  if (step === undefined || options === undefined) {
    const curriedStep = step as unknown as (state: S) => Promise<Poll<S, E>>;
    return (s: typeof curriedStep) => (o: PollOptions<S, E>) => runPoll(initial, s, o);
  }
  return runPoll(initial, step, options);
}

async function runPoll<S, E>(
  initial: S,
  step: (state: S) => Promise<Poll<S, E>>,
  options: PollOptions<S, E>
): Promise<Result<S, E>> {
  let state: S = initial;
  let interval = options.interval;
  let attempts = 0;

  if (options.maxAttempts !== undefined && options.exhausted === undefined) {
    throw new Error('poll: maxAttempts is set but exhausted factory is not provided');
  }

  // The awaits below are intentional: this is a sequential poll loop, not
  // a parallel batch. Each iteration depends on the previous outcome
  // (state + interval) and a `sleep` between them. Running them in
  // parallel would defeat the entire purpose of polling.
  /* eslint-disable no-await-in-loop */
  for (;;) {
    attempts += 1;
    const outcome = await step(state);

    switch (outcome._tag) {
      case 'Done':
        return ok(outcome.value);

      case 'Failed':
        return err(outcome.error);

      case 'Pending': {
        state = outcome.state;

        if (options.until?.(state) === true) {
          return ok(state);
        }

        if (options.maxAttempts !== undefined && attempts >= options.maxAttempts) {
          const factory = options.exhausted;
          if (factory === undefined) {
            // Unreachable: the guard at the top of the function catches this.
            // Defensive fallback in case the guard is ever loosened.
            throw new Error('poll: exhausted factory missing');
          }
          return err(factory(state, attempts));
        }

        await sleep(interval);
        if (options.backoff !== undefined) {
          interval = options.backoff(state);
        }
        continue;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
}
