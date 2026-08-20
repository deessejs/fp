/**
 * Maybe constructors: some(), none, maybe().
 *
 * `some()` is a factory function. `none` is the singleton exposed by
 * NoneImpl.NONE. `maybe()` lifts a nullable value into a Maybe.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Maybe, Some, None } from './types.js';
import { SomeImpl } from './internal/some-impl.js';
import { NoneImpl } from './internal/none-impl.js';

/**
 * Create a Some Maybe.
 *
 * @example
 * some(10).map(x => x * 2) // Some(20)
 */
export function some<T>(value: T): Some<T> {
  return new SomeImpl<T>(value);
}

/**
 * The None singleton.
 */
export const none: None = NoneImpl.NONE;

/**
 * Create Maybe from nullable value.
 *
 * @example
 * maybe(null)      // None
 * maybe(undefined) // None
 * maybe(10)        // Some(10)
 */
export function maybe<T>(value: T | null | undefined): Maybe<T> {
  return value != null ? some<T>(value) : none;
}
