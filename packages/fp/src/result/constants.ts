/**
 * Result constructors: ok(), err()
 *
 * Each factory returns a plain object whose shape satisfies the
 * discriminated union `Result<T,E>`. Inside the literal, every method
 * binds `this` to the public `Ok<T,E>` / `Err<T,E>` type — that is the
 * one annotation that lets short-circuit returns (`return this`)
 * type-check without chained casts.
 */

import type { Ok, Err, Result } from './types.js';
import type { Maybe } from '../maybe/types.js';
import { some, none } from '../maybe/constants.js';

/**
 * Create an Ok result.
 *
 * @example
 * ok(10).map(x => x * 2) // Ok(20)
 */
export function ok<T, E = never>(value: T): Ok<T, E> {
  // The first generic is T (the value), the second is E (the error).
  // `Ok<T, never>` is the default; consumers can widen E by annotating
  // their factories or chain `.filter(..., fn)` to produce a wider E.
  const okResult: Ok<T, E> = {
    _tag: 'Ok',
    value,
    map<B>(this: Ok<T, E>, fn: (value: T) => B): Result<B, E> {
      return ok<B, E>(fn(this.value));
    },
    flatMap<B, E2>(this: Ok<T, E>, fn: (value: T) => Result<B, E2>): Result<B, E | E2> {
      return fn(this.value);
    },
    mapError<E2>(this: Ok<T, E>, _fn: (error: never) => E2): Result<T, E2> {
      return this as unknown as Result<T, E2>;
    },
    filter(
      this: Ok<T, E>,
      predicate: (value: T) => boolean,
      errorFn?: (value: T) => E,
    ): Result<T, E> {
      if (predicate(this.value)) return this;
      if (errorFn) return err<T, E>(errorFn(this.value));
      return this;
    },
    tap(this: Ok<T, E>, fn: (value: T) => unknown): Result<T, E> {
      fn(this.value);
      return this;
    },
    tapAsync(this: Ok<T, E>, fn: (value: T) => Promise<unknown>): Promise<Result<T, E>> {
      return Promise.resolve(fn(this.value)).then(() => this);
    },
    flatMapAsync<B, E2>(
      this: Ok<T, E>,
      fn: (value: T) => Promise<Result<B, E2>>,
    ): Promise<Result<B, E | E2>> {
      return Promise.resolve(fn(this.value));
    },
    match<U>(this: Ok<T, E>, handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
      return handlers.ok(this.value);
    },
    fold<U>(this: Ok<T, E>, onOk: (value: T) => U, _onErr: (error: E) => U): U {
      return onOk(this.value);
    },
    getOrElse(this: Ok<T, E>, _defaultValue: T): T {
      return this.value;
    },
    getOrThrow(this: Ok<T, E>, _message?: string): T {
      return this.value;
    },
    getOrNull(this: Ok<T, E>): T | null {
      return this.value;
    },
    getOrUndefined(this: Ok<T, E>): T | undefined {
      return this.value;
    },
    toMaybe(this: Ok<T, E>): Maybe<T> {
      return some(this.value);
    },
    toOption(this: Ok<T, E>): Maybe<T> {
      return some(this.value);
    },
    isOk(this: Ok<T, E>): this is Ok<T, E> {
      return true;
    },
    isErr(this: Ok<T, E>): this is Err<T, E> {
      return false;
    },
  };
  return okResult;
}

/**
 * Create an Err result.
 *
 * @example
 * err('error').map(x => x * 2) // Err('error')
 */
export function err<T = never, E = never>(error: E): Err<T, E> {
  const errResult: Err<T, E> = {
    _tag: 'Err',
    error,
    map<B>(this: Err<T, E>, _fn: (value: never) => B): Result<B, E> {
      return this as unknown as Result<B, E>;
    },
    flatMap<B, E2>(this: Err<T, E>, _fn: (value: never) => Result<B, E2>): Result<B, E | E2> {
      return this as unknown as Result<B, E | E2>;
    },
    mapError<E2>(this: Err<T, E>, fn: (error: E) => E2): Err<T, E2> {
      return err<T, E2>(fn(this.error));
    },
    filter(
      this: Err<T, E>,
      _predicate: (value: never) => boolean,
      _errorFn?: (value: never) => E,
    ): Err<T, E> {
      return this;
    },
    tap(this: Err<T, E>, _fn: (value: never) => unknown): Err<T, E> {
      return this;
    },
    tapAsync(this: Err<T, E>, _fn: (value: never) => Promise<unknown>): Promise<Err<T, E>> {
      return Promise.resolve(this);
    },
    flatMapAsync<B, E2>(
      this: Err<T, E>,
      _fn: (value: never) => Promise<Result<B, E2>>,
    ): Promise<Result<B, E | E2>> {
      // Required because Err<T,E> structurally satisfies Result<B,E|E2>
      // by widening T to the union, but the compiler does not infer it
      // across two different generic type parameters without classes.
      return Promise.resolve(this as unknown as Err<B, E | E2>);
    },
    match<U>(this: Err<T, E>, handlers: { ok: (value: never) => U; err: (error: E) => U }): U {
      return handlers.err(this.error);
    },
    fold<U>(this: Err<T, E>, _onOk: (value: never) => U, onErr: (error: E) => U): U {
      return onErr(this.error);
    },
    getOrElse<U>(this: Err<T, E>, defaultValue: U): T | U {
      return defaultValue;
    },
    getOrThrow(this: Err<T, E>, message?: string): never {
      throw new Error(message ?? String(this.error));
    },
    getOrNull(this: Err<T, E>): null {
      return null;
    },
    getOrUndefined(this: Err<T, E>): undefined {
      return undefined;
    },
    toMaybe(this: Err<T, E>): Maybe<T> {
      return none as unknown as Maybe<T>;
    },
    toOption(this: Err<T, E>): Maybe<T> {
      return none as unknown as Maybe<T>;
    },
    isOk(this: Err<T, E>): this is Ok<T, E> {
      return false;
    },
    isErr(this: Err<T, E>): this is Err<T, E> {
      return true;
    },
  };
  return errResult;
}
