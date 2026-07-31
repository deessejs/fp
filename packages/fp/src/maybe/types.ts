import type { Result } from '../result/types.js';

/**
 * Some variant of Maybe - represents a present value
 */
export interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;

  // Instance methods
  map<B>(fn: (value: T) => B): Maybe<B>;
  flatMap<B>(fn: (value: T) => Maybe<B>): Maybe<B>;
  filter(predicate: (value: T) => boolean): Maybe<T>;
  filterMap<B>(fn: (value: T) => Maybe<B>): Maybe<B>;
  tap(fn: (value: T) => unknown): Maybe<T>;
  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Maybe<T>>;
  match<U>(handlers: { some: (value: T) => U; none: () => U }): U;
  fold<U>(onSome: (value: T) => U, _onNone: () => U): U;
  getOrElse(_defaultValue: T): T;
  getOrThrow(_message?: string): T;
  getOrNull(): T | null;
  getOrUndefined(): T | undefined;
  get<K extends keyof T>(key: K): Maybe<T[K]>;
  toResult<E>(_error: E): Result<T, E>;
  toArray(): T[];
  toIterable(): Iterable<T>;
  isSome(): this is Some<T>;
  isNone(): this is None;
}

/**
 * None variant of Maybe - represents an absent value
 */
export interface None {
  readonly _tag: 'None';

  // Instance methods
  map<B>(_fn: (value: never) => B): Maybe<B>;
  flatMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B>;
  filter(_predicate: (value: never) => boolean): Maybe<never>;
  filterMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B>;
  tap(_fn: (value: never) => unknown): Maybe<never>;
  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<Maybe<never>>;
  match<U>(handlers: { some: (value: never) => U; none: () => U }): U;
  fold<U>(_onSome: (value: never) => U, onNone: () => U): U;
  getOrElse<T>(defaultValue: T): T;
  getOrThrow(message?: string): never;
  getOrNull(): null;
  getOrUndefined(): undefined;
  get(_key: never): Maybe<never>;
  toResult<E>(error: E): Result<never, E>;
  toArray(): [];
  toIterable(): Iterable<never>;
  isSome(): this is Some<never>;
  isNone(): this is None;
}

/**
 * Discriminated union of Some and None
 */
export type Maybe<T> = Some<T> | None;