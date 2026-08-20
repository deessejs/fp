/**
 * Wrapping helpers — turn throwing functions into Result-returning
 * ones. These are the single source of truth that backs both the
 * `Result.fromThrowable` / `Result.fromAsyncThrowable` factories
 * and the `try_` / `tryPromise` aliases re-exported from
 * `src/try/index.ts`.
 *
 * The `Result<T, E>` type is the only reasoning: a thrown value is
 * captured into the `Err` variant, and `ok` / `err` are the only
 * construction entry points.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from './constants.js';
import type { Result } from './types.js';
import type { UnhandledException } from './types.js';

/**
 * Wrap a synchronous function that may throw.
 *
 * Two forms:
 *
 * - `fromThrowable(thunk)` — captures any thrown value into an
 *   {@link UnhandledException} carrying the original cause.
 * - `fromThrowable({ onSuccess, onError })` — runs `onSuccess`
 *   inside a `try`/`catch`; thrown values are mapped through
 *   `onError`.
 *
 * @example
 * const r = fromThrowable(() => JSON.parse(input));
 * // r: Result<unknown, UnhandledException>
 *
 * @example
 * const r = fromThrowable({
 *   onSuccess: () => fs.readFileSync(path, 'utf-8'),
 *   onError: (e) => (e instanceof Error ? e : new Error(String(e))),
 * });
 * // r: Result<string, Error>
 */
export function fromThrowable<T>(thunk: () => T): Result<T, UnhandledException>;
export function fromThrowable<T, E>(options: {
  readonly onSuccess: () => T;
  readonly onError: (cause: unknown) => E;
}): Result<T, E>;
export function fromThrowable<T, E>(
  arg: (() => T) | { readonly onSuccess: () => T; readonly onError: (cause: unknown) => E },
): Result<T, E> | Result<T, UnhandledException> {
  if (typeof arg === 'function') {
    try {
      return ok<T, UnhandledException>(arg());
    } catch (cause) {
      return err<T, UnhandledException>({ _tag: 'UnhandledException', cause });
    }
  }
  const opts = arg;
  try {
    return ok<T, E>(opts.onSuccess());
  } catch (cause) {
    return err<T, E>(opts.onError(cause));
  }
}

/**
 * Wrap an asynchronous function that may reject.
 *
 * Two forms mirror `fromThrowable`:
 *
 * - `fromAsyncThrowable(thunk)` — rejects (and sync throws) are
 *   captured into an {@link UnhandledException}.
 * - `fromAsyncThrowable({ onSuccess, onError })` — the caller maps
 *   the cause through `onError`, which may itself be async.
 *
 * @example
 * const r = await fromAsyncThrowable(() => fetch(url).then((res) => res.json()));
 * // r: Result<unknown, UnhandledException>
 *
 * @example
 * const r = await fromAsyncThrowable({
 *   onSuccess: () => orpc.templates.list(undefined, liveCache),
 *   onError: (e) => (e instanceof Error ? e : new Error(String(e))),
 * });
 * // r: Result<TemplatesList, Error>
 */
export function fromAsyncThrowable<T>(
  thunk: () => Promise<T>,
): Promise<Result<T, UnhandledException>>;
export function fromAsyncThrowable<T, E>(options: {
  readonly onSuccess: () => Promise<T>;
  readonly onError: (cause: unknown) => E | Promise<E>;
}): Promise<Result<T, E>>;
export async function fromAsyncThrowable<T, E>(
  arg:
    | (() => Promise<T>)
    | { readonly onSuccess: () => Promise<T>; readonly onError: (cause: unknown) => E | Promise<E> },
): Promise<Result<T, E> | Result<T, UnhandledException>> {
  if (typeof arg === 'function') {
    try {
      const value = await arg();
      return ok<T, UnhandledException>(value);
    } catch (cause) {
      return err<T, UnhandledException>({ _tag: 'UnhandledException', cause });
    }
  }
  const opts = arg;
  try {
    const value = await opts.onSuccess();
    return ok<T, E>(value);
  } catch (cause) {
    return err<T, E>(await opts.onError(cause));
  }
}
