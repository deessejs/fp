/**
 * Pipeable functions for Maybe.
 *
 * Each pipeable is a pure function with the shape
 * `(value) => (operand) => result`. They compose through `pipe`:
 * `pipe(value, map(fn), flatMap(chain))`.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Maybe, Some, None } from './types.js';
import type { Result } from '../result/types.js';

/**
 * Map over the Some value. Passes through on None.
 */
export function map<T, B>(fn: (value: T) => B): (maybe: Maybe<T>) => Maybe<B> {
  return (m) => m.map(fn);
}

/**
 * Bind through a function that returns a Maybe. Passes through on None.
 */
export function flatMap<T, B>(fn: (value: T) => Maybe<B>): (maybe: Maybe<T>) => Maybe<B> {
  return (m) => m.flatMap(fn);
}

/**
 * Filter on the Some value. Converts to None when the predicate fails.
 */
export function filter<T>(predicate: (value: T) => boolean): (maybe: Maybe<T>) => Maybe<T> {
  return (m) => m.filter(predicate);
}

/**
 * Map over the Some value, then flatten. Passes through on None.
 */
export function filterMap<T, B>(fn: (value: T) => Maybe<B>): (maybe: Maybe<T>) => Maybe<B> {
  return (m) => m.filterMap(fn);
}

/**
 * Side effect on the Some value. Passes through unchanged.
 */
export function tap<T>(fn: (value: T) => unknown): (maybe: Maybe<T>) => Maybe<T> {
  return (m) => m.tap(fn);
}

/**
 * Side effect on the Some value, async. Passes through unchanged.
 */
export function tapAsync<T>(fn: (value: T) => Promise<unknown>): (maybe: Maybe<T>) => Promise<Maybe<T>> {
  return (m) => m.tapAsync(fn);
}

/**
 * Pattern matching on Maybe.
 */
export function match<T, U>(handlers: {
  some: (value: T) => U;
  none: () => U;
}): (maybe: Maybe<T>) => U {
  return (m) => m.match(handlers);
}

/**
 * Fold over Maybe — apply one of two functions.
 */
export function fold<T, U>(onSome: (value: T) => U, onNone: () => U): (maybe: Maybe<T>) => U {
  return (m) => m.fold(onSome, onNone);
}

/**
 * Return the Some value, or a default on None.
 */
export function getOrElse<T>(defaultValue: T): (maybe: Maybe<T>) => T {
  return (m) => m.getOrElse(defaultValue);
}

/**
 * Return the Some value, or throw on None.
 */
export function getOrThrow<T>(message?: string): (maybe: Maybe<T>) => T {
  return (m) => m.getOrThrow(message);
}

/**
 * Return the Some value, or null on None.
 */
export function getOrNull<T>(): (maybe: Maybe<T>) => T | null {
  return (m) => m.getOrNull();
}

/**
 * Return the Some value, or undefined on None.
 */
export function getOrUndefined<T>(): (maybe: Maybe<T>) => T | undefined {
  return (m) => m.getOrUndefined();
}

/**
 * Project a property of the Some value, returning a Maybe.
 *
 * Because the inferred `K` cannot be recovered from the type of the
 * `Maybe` value alone, the return type is widened to `Maybe<T[keyof T]>`.
 * Callers who need a narrower type should use the instance method
 * directly: `some(value).get(specificKey)`.
 */
export function get<T>(key: keyof T): (maybe: Maybe<T>) => Maybe<T[keyof T]> {
  return (m) => m.get(key);
}

/**
 * Convert to a Result. None becomes Err with the given error.
 */
export function toResult<T, E>(error: E): (maybe: Maybe<T>) => Result<T, E> {
  return (m) => m.toResult(error);
}

/**
 * Convert to an array. None becomes an empty array.
 */
export function toArray<T>(): (maybe: Maybe<T>) => T[] {
  return (m) => m.toArray();
}

/**
 * Convert to an iterable. None becomes an empty iterable.
 */
export function toIterable<T>(): (maybe: Maybe<T>) => Iterable<T> {
  return (m) => m.toIterable();
}

/**
 * Type predicate: is Some.
 */
export function isSome<T>(m: Maybe<T>): m is Some<T> {
  return m.isSome();
}

/**
 * Type predicate: is None.
 */
export function isNone<T>(m: Maybe<T>): m is None {
  return m.isNone();
}
