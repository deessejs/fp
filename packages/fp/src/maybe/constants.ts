/**
 * Maybe constructors: some(), none(), maybe()
 *
 * Each factory returns a plain object whose shape satisfies the
 * discriminated union `Maybe<T>`. Inside the literal, every method
 * binds `this` to the public `Some<T>` / `None` type — that is the
 * one annotation that lets short-circuit returns (`return this`,
 * `return none`) type-check without chained casts.
 */

import type { Some, None, Maybe } from './types.js';
import type { Result } from '../result/types.js';
import { ok, err } from '../result/constants.js';

/**
 * Create a Some Maybe.
 *
 * @example
 * some(10).map(x => x * 2) // Some(20)
 */
export function some<T>(value: T): Some<T> {
  const someResult: Some<T> = {
    _tag: 'Some',
    value,
    map<B>(this: Some<T>, fn: (value: T) => B): Maybe<B> {
      return some<B>(fn(this.value));
    },
    flatMap<B>(this: Some<T>, fn: (value: T) => Maybe<B>): Maybe<B> {
      return fn(this.value);
    },
    filter(this: Some<T>, predicate: (value: T) => boolean): Maybe<T> {
      return predicate(this.value) ? this : none;
    },
    filterMap<B>(this: Some<T>, fn: (value: T) => Maybe<B>): Maybe<B> {
      return fn(this.value);
    },
    tap(this: Some<T>, fn: (value: T) => unknown): Maybe<T> {
      fn(this.value);
      return this;
    },
    tapAsync(this: Some<T>, fn: (value: T) => Promise<unknown>): Promise<Maybe<T>> {
      return Promise.resolve(fn(this.value)).then(() => this);
    },
    match<U>(this: Some<T>, handlers: { some: (value: T) => U; none: () => U }): U {
      return handlers.some(this.value);
    },
    fold<U>(this: Some<T>, onSome: (value: T) => U, _onNone: () => U): U {
      return onSome(this.value);
    },
    getOrElse<U>(this: Some<T>, _defaultValue: U): T | U {
      return this.value;
    },
    getOrThrow(this: Some<T>, _message?: string): T {
      return this.value;
    },
    getOrNull(this: Some<T>): T | null {
      return this.value;
    },
    getOrUndefined(this: Some<T>): T | undefined {
      return this.value;
    },
    get<K extends keyof T>(this: Some<T>, key: K): Maybe<T[K]> {
      return maybe(this.value[key]);
    },
    toResult<E>(this: Some<T>, _error: E): Result<T, E> {
      return ok<T, E>(this.value);
    },
    toArray(this: Some<T>): T[] {
      return [this.value];
    },
    toIterable(this: Some<T>): Iterable<T> {
      return [this.value];
    },
    isSome(this: Some<T>): this is Some<T> {
      return true;
    },
    isNone(this: Some<T>): this is None {
      return false;
    },
  };
  return someResult;
}

/**
 * The None singleton.
 */
export const none: None = (() => {
  const noneResult: None = {
    _tag: 'None',
    map<B>(this: None, _fn: (value: never) => B): Maybe<B> {
      return this;
    },
    flatMap<B>(this: None, _fn: (value: never) => Maybe<B>): Maybe<B> {
      return this;
    },
    filter(this: None, _predicate: (value: never) => boolean): Maybe<never> {
      return this;
    },
    filterMap<B>(this: None, _fn: (value: never) => Maybe<B>): Maybe<B> {
      return this;
    },
    tap(this: None, _fn: (value: never) => unknown): Maybe<never> {
      return this;
    },
    tapAsync(this: None, _fn: (value: never) => Promise<unknown>): Promise<Maybe<never>> {
      return Promise.resolve(this);
    },
    match<U>(this: None, handlers: { some: (value: never) => U; none: () => U }): U {
      return handlers.none();
    },
    fold<U>(this: None, _onSome: (value: never) => U, onNone: () => U): U {
      return onNone();
    },
    getOrElse<U>(this: None, defaultValue: U): never | U {
      return defaultValue;
    },
    getOrThrow(this: None, message?: string): never {
      throw new Error(message ?? 'Expected Some but got None');
    },
    getOrNull(this: None): null {
      return null;
    },
    getOrUndefined(this: None): undefined {
      return undefined;
    },
    get(this: None, _key: never): Maybe<never> {
      return this;
    },
    toResult<E>(this: None, error: E): Result<never, E> {
      return err<never, E>(error);
    },
    toArray(this: None): [] {
      return [];
    },
    toIterable(this: None): Iterable<never> {
      return [];
    },
    isSome(this: None): this is Some<never> {
      return false;
    },
    isNone(this: None): this is None {
      return true;
    },
  };
  return noneResult;
})();

/**
 * Create Maybe from nullable value.
 *
 * @example
 * maybe(null)      // None
 * maybe(undefined) // None
 * maybe(10)        // Some(10)
 */
export function maybe<T>(value: T | null | undefined): Maybe<T> {
  return value != null ? some<T>(value) : (none as Maybe<T>);
}
