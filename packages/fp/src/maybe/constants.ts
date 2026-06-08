/**
 * Maybe constructors: some(), none(), maybe()
 */

import type { Some, None, Maybe } from './types';
import type { Result } from '../result/types';

/**
 * Create a Some Maybe
 *
 * @example
 * some(10).map(x => x * 2) // Some(20)
 */
export function some<T>(value: T): Some<T> {
  return {
    _tag: 'Some',
    value,
    map<B>(fn: (value: T) => B): Maybe<B> {
      return some(fn(value));
    },
    flatMap<B>(fn: (value: T) => Maybe<B>): Maybe<B> {
      return fn(value);
    },
    filter(predicate: (value: T) => boolean): Maybe<T> {
      return predicate(value) ? this : none;
    },
    filterMap<B>(fn: (value: T) => Maybe<B>): Maybe<B> {
      return fn(value);
    },
    tap(fn: (value: T) => unknown): Maybe<T> {
      fn(value);
      return this;
    },
    tapAsync(fn: (value: T) => Promise<unknown>): Promise<Maybe<T>> {
      return Promise.resolve(fn(value)).then(() => this);
    },
    match<U>(handlers: { some: (value: T) => U; none: () => U }): U {
      return handlers.some(value);
    },
    fold<U>(onSome: (value: T) => U, _onNone: () => U): U {
      return onSome(value);
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
    get<K extends keyof T>(key: K): Maybe<T[K]> {
      return maybe(value[key]);
    },
    toResult<E>(_error: E): Result<T, E> {
      return { _tag: 'Ok', value, isOk: () => true, isErr: () => false } as Result<T, E>;
    },
    toArray(): T[] {
      return [value];
    },
    toIterable(): Iterable<T> {
      return [value];
    },
    isSome(): this is Some<T> {
      return true;
    },
    isNone(): this is None {
      return false;
    },
  };
}

/**
 * The None singleton
 */
export const none: None = {
  _tag: 'None',
  map<B>(_fn: (value: never) => B): Maybe<B> {
    return none;
  },
  flatMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B> {
    return none;
  },
  filter(_predicate: (value: never) => boolean): Maybe<never> {
    return none;
  },
  filterMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B> {
    return none;
  },
  tap(_fn: (value: never) => unknown): Maybe<never> {
    return none;
  },
  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<Maybe<never>> {
    return Promise.resolve(none);
  },
  match<U>(handlers: { some: (value: never) => U; none: () => U }): U {
    return handlers.none();
  },
  fold<U>(_onSome: (value: never) => U, onNone: () => U): U {
    return onNone();
  },
  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  },
  getOrThrow(message?: string): never {
    throw new Error(message ?? 'Expected Some but got None');
  },
  getOrNull(): null {
    return null;
  },
  getOrUndefined(): undefined {
    return undefined;
  },
  get(_key: never): Maybe<never> {
    return none;
  },
  toResult<E>(error: E): Result<never, E> {
    return { _tag: 'Err', error, isOk: () => false, isErr: () => true } as Result<never, E>;
  },
  toArray(): [] {
    return [];
  },
  toIterable(): Iterable<never> {
    return [];
  },
  isSome(): this is Some<never> {
    return false;
  },
  isNone(): this is None {
    return true;
  },
};

/**
 * Create Maybe from nullable value
 *
 * @example
 * maybe(null)     // None
 * maybe(undefined) // None
 * maybe(10)       // Some(10)
 */
export function maybe<T>(value: T | null | undefined): Maybe<T> {
  return value != null ? some(value) : none;
}