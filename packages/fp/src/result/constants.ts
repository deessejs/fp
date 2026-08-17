/**
 * Result constructors: ok(), err().
 *
 * Each factory is the only public entry point into the corresponding
 * internal class. Consumers cannot `new OkImpl(...)` directly because
 * the class is not exported.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Ok, Err } from './types.js';
import { OkImpl } from './internal/ok-impl.js';
import { ErrImpl } from './internal/err-impl.js';

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
