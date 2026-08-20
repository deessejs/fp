/**
 * Pipeable functions for Try.
 *
 * Each pipeable is a pure function with the shape
 * `(value) => (operand) => result`. They compose through `pipe`:
 * `pipe(value, map(fn), flatMap(chain))`.
 *
 * The instance methods on `Success` and `Failure` remain for
 * ergonomics. The pipeables are the preferred surface for
 * composition pipelines.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../result/types.js';
import type { Try, Success, Failure } from './types.js';

/**
 * Map over the Success value. Passes through on Failure.
 */
export function map<T, E, B>(fn: (value: T) => B): (t: Try<T, E>) => Try<B, E> {
  return (t) => t.map(fn);
}

/**
 * Bind through a function that returns a Try. Passes through on Failure.
 */
export function flatMap<T, E, B, E2>(
  fn: (value: T) => Try<B, E2>,
): (t: Try<T, E>) => Try<B, E | E2> {
  return (t) => t.flatMap(fn);
}

/**
 * Map over the Failure cause. Passes through on Success.
 */
export function mapError<T, E, E2>(fn: (cause: E) => E2): (t: Try<T, E>) => Try<T, E2> {
  return (t) => t.mapError(fn);
}

/**
 * Side effect on the Success value. Passes through unchanged.
 */
export function tap<T, E>(fn: (value: T) => unknown): (t: Try<T, E>) => Try<T, E> {
  return (t) => t.tap(fn);
}

/**
 * Side effect on the Success value, async. Passes through unchanged.
 */
export function tapAsync<T, E>(
  fn: (value: T) => Promise<unknown>,
): (t: Try<T, E>) => Promise<Try<T, E>> {
  return (t) => t.tapAsync(fn);
}

/**
 * Bind through a function that returns a `Promise<Try>`. Passes through
 * on Failure.
 */
export function flatMapAsync<T, E, B, E2>(
  fn: (value: T) => Promise<Try<B, E2>>,
): (t: Try<T, E>) => Promise<Try<B, E | E2>> {
  return (t) => t.flatMapAsync(fn);
}

/**
 * Pattern matching on Try.
 */
export function match<T, E, U>(handlers: {
  readonly success: (value: T) => U;
  readonly failure: (cause: E) => U;
}): (t: Try<T, E>) => U {
  return (t) => t.match(handlers);
}

/**
 * Fold over Try — apply one of two functions.
 */
export function fold<T, E, U>(
  onSuccess: (value: T) => U,
  onFailure: (cause: E) => U,
): (t: Try<T, E>) => U {
  return (t) => t.fold(onSuccess, onFailure);
}

/**
 * Return the Success value, or a default on Failure.
 */
export function getOrElse<T, E>(defaultValue: T): (t: Try<T, E>) => T {
  return (t) => t.getOrElse(defaultValue);
}

/**
 * Return the Success value, or throw on Failure.
 */
export function getOrThrow<T, E>(message?: string): (t: Try<T, E>) => T {
  return (t) => t.getOrThrow(message);
}

/**
 * Return the Success value, or `null` on Failure.
 */
export function getOrNull<T, E>(): (t: Try<T, E>) => T | null {
  return (t) => t.getOrNull();
}

/**
 * Return the Success value, or `undefined` on Failure.
 */
export function getOrUndefined<T, E>(): (t: Try<T, E>) => T | undefined {
  return (t) => t.getOrUndefined();
}

/**
 * Convert to a {@link Result}. Success becomes Ok; Failure becomes Err.
 */
export function toResult<T, E>(): (t: Try<T, E>) => Result<T, E> {
  return (t) => t.toResult();
}

/**
 * Type predicate: is Success.
 */
export function isSuccess<T, E>(t: Try<T, E>): t is Success<T, E> {
  return t.isSuccess();
}

/**
 * Type predicate: is Failure.
 */
export function isFailure<T, E>(t: Try<T, E>): t is Failure<T, E> {
  return t.isFailure();
}
