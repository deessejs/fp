/**
 * Try constructors: success(), failure(), try_(), tryPromise().
 *
 * Each factory is the only public entry point into the corresponding
 * internal class. Consumers cannot `new SuccessImpl(...)` or
 * `new FailureImpl(...)` directly because the classes are not
 * exported.
 *
 * `try_` and `tryPromise` carry two overloads each: a thunk-only form
 * that captures any thrown value as-is into an `UnhandledException`,
 * and an object form `{ onSuccess, onError }` that maps the thrown
 * value through the caller-supplied `onError` mapper.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Try, Success, Failure, UnhandledException } from './types.js';
import { SuccessImpl } from './internal/success-impl.js';
import { FailureImpl } from './internal/failure-impl.js';

/**
 * Create a Success result.
 *
 * @example
 * success(10).map(x => x * 2) // Success(20)
 */
export function success<T, E = never>(value: T): Success<T, E> {
  return new SuccessImpl<T, E>(value);
}

/**
 * Create a Failure result.
 *
 * @example
 * failure('error').map(x => x * 2) // Failure('error')
 */
export function failure<T = never, E = never>(cause: E): Failure<T, E> {
  return new FailureImpl<T, E>(cause);
}

/**
 * Wrap a synchronous throwing function into a {@link Try}.
 *
 * Two forms:
 *
 * - `try_(thunk)` — captures any thrown value into an
 *   {@link UnhandledException} carrying the original cause.
 * - `try_({ onSuccess, onError })` — runs `onSuccess` inside a
 *   `try`/`catch`; thrown values are mapped through `onError`.
 *
 * @example
 * try_(() => JSON.parse(input))
 * // -> Success<unknown> | Failure<UnhandledException>
 *
 * @example
 * try_({
 *   onSuccess: () => fs.readFileSync(path, 'utf-8'),
 *   onError: (e) => e instanceof Error ? e : new Error(String(e)),
 * })
 * // -> Success<string> | Failure<Error>
 */
export function try_<T>(thunk: () => T): Try<T, UnhandledException>;
export function try_<T, E>(options: {
  readonly onSuccess: () => T;
  readonly onError: (cause: unknown) => E;
}): Try<T, E>;
export function try_<T, E>(
  arg: (() => T) | { readonly onSuccess: () => T; readonly onError: (cause: unknown) => E },
): Try<T, E> | Try<T, UnhandledException> {
  if (typeof arg === 'function') {
    try {
      return success<T, UnhandledException>(arg());
    } catch (cause) {
      return failure<T, UnhandledException>({ _tag: 'UnhandledException', cause });
    }
  }
  const opts = arg;
  try {
    return success<T, E>(opts.onSuccess());
  } catch (cause) {
    return failure<T, E>(opts.onError(cause));
  }
}

/**
 * Wrap an asynchronous throwing function into a `Promise<Try<T, E>>`.
 *
 * Two forms mirror `try_`:
 *
 * - `tryPromise(thunk)` — rejects are captured into an
 *   {@link UnhandledException} carrying the original cause.
 * - `tryPromise({ onSuccess, onError })` — rejects (and sync throws)
 *   are mapped through `onError`, which may itself be async.
 *
 * @example
 * await tryPromise(() => fetch(url).then(r => r.json()))
 *
 * @example
 * await tryPromise({
 *   onSuccess: () => orpc.templates.list(undefined, liveCache),
 *   onError: (e) => e instanceof Error ? e : new Error(String(e)),
 * })
 */
export function tryPromise<T>(thunk: () => Promise<T>): Promise<Try<T, UnhandledException>>;
export function tryPromise<T, E>(options: {
  readonly onSuccess: () => Promise<T>;
  readonly onError: (cause: unknown) => E | Promise<E>;
}): Promise<Try<T, E>>;
export async function tryPromise<T, E>(
  arg:
    | (() => Promise<T>)
    | { readonly onSuccess: () => Promise<T>; readonly onError: (cause: unknown) => E | Promise<E> },
): Promise<Try<T, E> | Try<T, UnhandledException>> {
  if (typeof arg === 'function') {
    try {
      const value = await arg();
      return success<T, UnhandledException>(value);
    } catch (cause) {
      return failure<T, UnhandledException>({ _tag: 'UnhandledException', cause });
    }
  }
  const opts = arg;
  try {
    const value = await opts.onSuccess();
    return success<T, E>(value);
  } catch (cause) {
    return failure<T, E>(await opts.onError(cause));
  }
}
