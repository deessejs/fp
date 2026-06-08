/**
 * Result constructors: ok(), err()
 */

import type { Ok, Err, Result } from './types';
import type { Maybe } from '../maybe/types';

/**
 * Create an Ok result
 *
 * @example
 * ok(10).map(x => x * 2) // Ok(20)
 */
export function ok<T>(value: T): Ok<T, never> {
  return {
    _tag: 'Ok',
    value,
    map<B>(fn: (value: T) => B): Result<B, never> {
      return ok(fn(value));
    },
    flatMap<B, E2>(fn: (value: T) => Result<B, E2>): Result<B, E2> {
      return fn(value);
    },
    mapError<E2>(_fn: (error: never) => E2): Result<T, E2> {
      return this as unknown as Result<T, E2>;
    },
    filter(predicate: (value: T) => boolean, _errorFn?: (value: T) => never): Result<T, never> {
      return predicate(value) ? this : ok(value) as Result<T, never>;
    },
    tap(fn: (value: T) => unknown): Result<T, never> {
      fn(value);
      return this;
    },
    tapAsync(fn: (value: T) => Promise<unknown>): Promise<Result<T, never>> {
      return Promise.resolve(fn(value)).then(() => this);
    },
    flatMapAsync<B, E2>(fn: (value: T) => Promise<Result<B, E2>>): Promise<Result<B, E2>> {
      return Promise.resolve(fn(value));
    },
    match<U>(handlers: { ok: (value: T) => U; err: (error: never) => U }): U {
      return handlers.ok(value);
    },
    fold<U>(onOk: (value: T) => U, _onErr: (error: never) => U): U {
      return onOk(value);
    },
    getOrElse(_defaultValue: T): T {
      return value;
    },
    getOrThrow(_message?: string): T {
      return value;
    },
    getOrNull(): T | null {
      return value;
    },
    getOrUndefined(): T | undefined {
      return value;
    },
    toMaybe(): Maybe<T> {
      return { _tag: 'Some', value } as Maybe<T>;
    },
    isOk(): this is Ok<T, never> {
      return true;
    },
    isErr(): this is Err<T, never> {
      return false;
    },
  };
}

/**
 * Create an Err result
 *
 * @example
 * err('error').map(x => x * 2) // Err('error')
 */
export function err<E>(error: E): Err<never, E> {
  return {
    _tag: 'Err',
    error,
    map<B>(_fn: (value: never) => B): Result<B, E> {
      return this as unknown as Err<B, E>;
    },
    flatMap<B, E2>(_fn: (value: never) => Result<B, E2>): Result<B, E | E2> {
      return this as unknown as Err<B, E | E2>;
    },
    mapError<E2>(fn: (error: E) => E2): Result<never, E2> {
      return { _tag: 'Err', error: fn(error), isOk: () => false, isErr: () => true } as Err<never, E2>;
    },
    filter(_predicate: (value: never) => boolean, _errorFn?: (value: never) => E): Result<never, E> {
      return this as Err<never, E>;
    },
    tap(_fn: (value: never) => unknown): Result<never, E> {
      return this;
    },
    tapAsync(_fn: (value: never) => Promise<unknown>): Promise<Result<never, E>> {
      return Promise.resolve(this);
    },
    flatMapAsync<B, E2>(_fn: (value: never) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>> {
      return Promise.resolve(this as unknown as Err<B, E | E2>);
    },
    match<U>(handlers: { ok: (value: never) => U; err: (error: E) => U }): U {
      return handlers.err(error);
    },
    fold<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U {
      return onErr(error);
    },
    getOrElse<T>(defaultValue: T): T {
      return defaultValue;
    },
    getOrThrow(message?: string): never {
      throw new Error(message ?? String(error));
    },
    getOrNull(): null {
      return null;
    },
    getOrUndefined(): undefined {
      return undefined;
    },
    toMaybe(): Maybe<never> {
      return { _tag: 'None' } as Maybe<never>;
    },
    isOk(): this is Ok<never, E> {
      return false;
    },
    isErr(): this is Err<never, E> {
      return true;
    },
  };
}