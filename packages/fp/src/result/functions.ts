/**
 * Pipeable functions for Result.
 *
 * Each pipeable is a pure function with the shape
 * `(value) => (operand) => result`. They compose through `pipe`:
 * `pipe(value, map(fn), flatMap(chain))`.
 *
 * The instance methods on `Ok` and `Err` remain for ergonomics. The
 * pipeables are the preferred surface for composition pipelines.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Ok, Err, Result } from './types.js';
import type { Maybe } from '../maybe/types.js';

// -----------------------------------------------------------------------------
// Synchronous pipeables
// -----------------------------------------------------------------------------

/**
 * Map over the Ok value. Passes through on Err.
 */
export function map<T, E, B>(fn: (value: T) => B): (result: Result<T, E>) => Result<B, E> {
  return (result) => result.map(fn);
}

/**
 * Bind through a function that returns a Result. Passes through on Err.
 */
export function flatMap<T, E, B, E2>(
  fn: (value: T) => Result<B, E2>,
): (result: Result<T, E>) => Result<B, E | E2> {
  return (result) => result.flatMap(fn);
}

/**
 * Map over the Err value. Passes through on Ok.
 */
export function mapError<T, E, E2>(
  fn: (error: E) => E2,
): (result: Result<T, E>) => Result<T, E2> {
  return (result) => result.mapError(fn);
}

/**
 * Filter on the Ok value. Converts to Err when the predicate fails.
 */
export function filter<T, E>(
  predicate: (value: T) => boolean,
  errorFn?: (value: T) => E,
): (result: Result<T, E>) => Result<T, E> {
  return (result) => result.filter(predicate, errorFn);
}

/**
 * Side effect on the Ok value. Passes through unchanged.
 */
export function tap<T, E>(fn: (value: T) => unknown): (result: Result<T, E>) => Result<T, E> {
  return (result) => result.tap(fn);
}

/**
 * Side effect on the Ok value, async. Passes through unchanged.
 */
export function tapAsync<T, E>(
  fn: (value: T) => Promise<unknown>,
): (result: Result<T, E>) => Promise<Result<T, E>> {
  return (result) => result.tapAsync(fn);
}

/**
 * Bind through a function that returns a Promise<Result>. Passes through on Err.
 */
export function flatMapAsync<T, E, B, E2>(
  fn: (value: T) => Promise<Result<B, E2>>,
): (result: Result<T, E>) => Promise<Result<B, E | E2>> {
  return (result) => result.flatMapAsync(fn);
}

/**
 * Pattern matching on Result.
 */
export function match<T, E, U>(handlers: {
  ok: (value: T) => U;
  err: (error: E) => U;
}): (result: Result<T, E>) => U {
  return (result) => result.match(handlers);
}

/**
 * Fold over Result — apply one of two functions.
 */
export function fold<T, E, U>(
  onOk: (value: T) => U,
  onErr: (error: E) => U,
): (result: Result<T, E>) => U {
  return (result) => result.fold(onOk, onErr);
}

/**
 * Return the Ok value, or a default on Err.
 */
export function getOrElse<T, E>(defaultValue: T): (result: Result<T, E>) => T {
  return (result) => result.getOrElse(defaultValue);
}

/**
 * Return the Ok value, or throw on Err.
 */
export function getOrThrow<T, E>(message?: string): (result: Result<T, E>) => T {
  return (result) => result.getOrThrow(message);
}

/**
 * Return the Ok value, or null on Err.
 */
export function getOrNull<T, E>(): (result: Result<T, E>) => T | null {
  return (result) => result.getOrNull();
}

/**
 * Return the Ok value, or undefined on Err.
 */
export function getOrUndefined<T, E>(): (result: Result<T, E>) => T | undefined {
  return (result) => result.getOrUndefined();
}

/**
 * Convert to a Maybe.
 */
export function toMaybe<T, E>(): (result: Result<T, E>) => Maybe<T> {
  return (result) => result.toMaybe();
}

/**
 * Alias for `toMaybe`. Kept for expressive parity with the instance method.
 */
export function toOption<T, E>(): (result: Result<T, E>) => Maybe<T> {
  return (result) => result.toOption();
}

/**
 * Type predicate: is Ok.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.isOk();
}

/**
 * Type predicate: is Err.
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<T, E> {
  return result.isErr();
}
