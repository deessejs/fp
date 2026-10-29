/**
 * Poll — a small ADT for iterative processes that may resolve,
 * continue, or fail. Designed for OAuth device flow, retry-until-ready
 * patterns, and other "ask again later" workflows.
 *
 * Three branches:
 *
 * - `pending` — the operation is in progress but not yet complete.
 *   The step function returned state to carry into the next attempt.
 * - `done` — the operation completed successfully. The `value` is the
 *   final state, which is what gets returned to the caller of the
 *   `poll()` runner.
 * - `failed` — the operation gave up. The `error` is the final failure
 *   that gets surfaced to the caller.
 *
 * The pending branch is what distinguishes Poll from Result. "Continue"
 * is a first-class outcome, not an error.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../result/types.js';

export type Pending<S> = {
  readonly _tag: 'Pending';
  readonly state: S;
};

export type Done<S> = {
  readonly _tag: 'Done';
  readonly value: S;
};

export type Failed<E> = {
  readonly _tag: 'Failed';
  readonly error: E;
};

export type Poll<S, E> = Pending<S> | Done<S> | Failed<E>;

/**
 * Configuration for {@link poll}.
 *
 * - `interval` — milliseconds to wait between attempts. Required.
 * - `backoff` — optional function returning the next interval given the
 *   current state. Called after a `pending` outcome. Returning the same
 *   value as the current interval is a no-op. Used to implement
 *   exponential backoff or "slow_down" handling.
 * - `until` — optional predicate evaluated after each `pending`. When it
 *   returns `true`, the loop stops and the current state is returned
 *   wrapped as `done`. Used to cap total wall-clock time or attempt
 *   count without coupling the step function to either.
 * - `maxAttempts` — optional hard cap. When reached, the current state
 *   is returned wrapped as `failed` with the supplied `exhausted` error
 *   factory. This is a safety net; prefer `until` for richer stop
 *   conditions.
 * - `exhausted` — required if `maxAttempts` is set. The factory receives
 *   the final state and the attempt count, and returns the error value
 *   to use when the cap is hit.
 */
export interface PollOptions<S, E> {
  readonly interval: number;
  readonly backoff?: (state: S) => number;
  readonly until?: (state: S) => boolean;
  readonly maxAttempts?: number;
  readonly exhausted?: (state: S, attempts: number) => E;
}

/**
 * Configuration for {@link poll}. Bundles the initial state, the step
 * function, and the loop options into a single argument so the call
 * site reads as one block instead of three positional arguments.
 *
 * - `initial` — the state the runner starts with. The first call to
 *   `handler` receives this exact value. Subsequent calls receive
 *   whatever the previous `pending(...)` returned.
 * - `handler` — called once per attempt with the current state. Returns
 *   a {@link Poll} outcome (`pending`, `done`, or `failed`). Same shape
 *   as the previous positional `step` argument; renamed to `handler`
 *   because that is what the function does.
 * - The remaining fields are the same as {@link PollOptions}.
 */
export interface PollConfig<S, E> extends PollOptions<S, E> {
  readonly initial: S;
  readonly handler: (state: S) => Promise<Poll<S, E>>;
}
