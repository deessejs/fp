/**
 * Ok variant of Result - represents a successful computation
 */
export interface Ok<T, E = never> {
  readonly _tag: 'Ok';
  readonly value: T;

  // Instance methods
  map<B>(fn: (value: T) => B): Result<B, E>;
  flatMap<B, E2>(fn: (value: T) => Result<B, E2>): Result<B, E | E2>;
  mapError<E2>(_fn: (error: never) => E2): Result<T, E2>;
  filter(predicate: (value: T) => boolean, _errorFn?: (value: T) => E): Result<T, E>;
  tap(fn: (value: T) => unknown): Result<T, E>;
  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Result<T, E>>;
  flatMapAsync<B, E2>(fn: (value: T) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>>;
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U;
  fold<U>(onOk: (value: T) => U, _onErr: (error: E) => U): U;
  getOrElse(_defaultValue: T): T;
  getOrThrow(_message?: string): T;
  getOrNull(): T | null;
  getOrUndefined(): T | undefined;
  toMaybe(): Maybe<T>;
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
}

/**
 * Err variant of Result - represents a failed computation
 */
export interface Err<T = never, E = never> {
  readonly _tag: 'Err';
  readonly error: E;

  // Instance methods
  map<B>(_fn: (value: never) => B): Result<B, E>;
  flatMap<B, E2>(_fn: (value: never) => Result<B, E2>): Result<B, E | E2>;
  mapError<E2>(fn: (error: E) => E2): Result<T, E2>;
  filter(_predicate: (value: never) => boolean, _errorFn?: (value: never) => E): Result<T, E>;
  tap(_fn: (value: never) => unknown): Result<T, E>;
  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<Result<T, E>>;
  flatMapAsync<B, E2>(_fn: (value: never) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>>;
  match<U>(handlers: { ok: (value: never) => U; err: (error: E) => U }): U;
  fold<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U;
  getOrElse(defaultValue: T): T;
  getOrThrow(message?: string): never;
  getOrNull(): null;
  getOrUndefined(): undefined;
  toMaybe(): Maybe<T>;
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<T, E>;
}

/**
 * Discriminated union of Ok and Err
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

import type { Maybe } from '../maybe/types';