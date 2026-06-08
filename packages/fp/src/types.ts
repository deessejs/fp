/**
 * Shared type utilities for Result and Maybe
 */

import type { Ok, Err, Result } from './result/types';
import type { Some, None, Maybe } from './maybe/types';

/**
 * Check if a value is a Result
 */
export function isResult(value: unknown): value is Result<unknown, unknown> {
  // TODO: implement
  return typeof value === 'object' && value !== null &&
    ('_tag' in value && (value as Result<unknown, unknown>)._tag === 'Ok' || (value as Result<unknown, unknown>)._tag === 'Err');
}

/**
 * Check if a value is a Maybe
 */
export function isMaybe(value: unknown): value is Maybe<unknown> {
  // TODO: implement
  return typeof value === 'object' && value !== null &&
    ('_tag' in value && ((value as Maybe<unknown>)._tag === 'Some' || (value as Maybe<unknown>)._tag === 'None'));
}

/**
 * Extract Ok value type from Result
 *
 * @example
 * type T = OkType<Result<string, Error>>; // string
 */
export type OkType<R extends Result<unknown, unknown>> =
  R extends Ok<infer T, unknown> ? T : never;

/**
 * Extract Err type from Result
 *
 * @example
 * type E = ErrType<Result<string, Error>>; // Error
 */
export type ErrType<R extends Result<unknown, unknown>> =
  R extends Ok<unknown, infer E> ? E : never;

/**
 * Extract Some value type from Maybe
 *
 * @example
 * type T = SomeType<Maybe<string>>; // string
 */
export type SomeType<M extends Maybe<unknown>> =
  M extends Some<infer T> ? T : never;