/**
 * Result constructors: ok(), err(), fromThrowable(),
 * fromAsyncThrowable().
 *
 * `ok` and `err` are the only public entry points into the
 * `OkImpl` / `ErrImpl` classes. `fromThrowable` and
 * `fromAsyncThrowable` are thin wrappers that catch thrown values
 * and surface them as `Err`.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Ok, Err } from './types.js';
import { OkImpl } from './internal/ok-impl.js';
import { ErrImpl } from './internal/err-impl.js';

export { fromThrowable, fromAsyncThrowable } from './wrapping.js';

/**
 * Create an Ok result.
 *
 * @example
 * ok(10).map(x => x * 2) // Ok(20)
 */
export function ok<T, E = never>(value: T): Ok<T, E> {
  return new OkImpl<T, E>(value);
}

/**
 * Create an Err result.
 *
 * @example
 * err('error').map(x => x * 2) // Err('error')
 */
export function err<T = never, E = never>(error: E): Err<T, E> {
  return new ErrImpl<T, E>(error);
}
