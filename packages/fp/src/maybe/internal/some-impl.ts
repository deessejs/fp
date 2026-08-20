/**
 * SomeImpl — internal implementation of the Some variant.
 *
 * Not exported. The public surface is the `Some<T>` type alias (in
 * `./types.ts`) and the `some()` factory (in `../constants.ts`).
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../../result/types.js';
import { ok } from '../../result/constants.js';
import type { Maybe } from '../types.js';
import { maybe } from '../constants.js';
import { NoneImpl } from './none-impl.js';

export class SomeImpl<T> {
  readonly _tag = 'Some' as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  map<B>(fn: (value: T) => B): Maybe<B> {
    return new SomeImpl<B>(fn(this.value));
  }

  flatMap<B>(fn: (value: T) => Maybe<B>): Maybe<B> {
    return fn(this.value);
  }

  filter(predicate: (value: T) => boolean): Maybe<T> {
    return predicate(this.value) ? this : NoneImpl.NONE;
  }

  filterMap<B>(fn: (value: T) => Maybe<B>): Maybe<B> {
    return fn(this.value);
  }

  tap(fn: (value: T) => unknown): Maybe<T> {
    fn(this.value);
    return this;
  }

  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Maybe<T>> {
    return Promise.resolve(fn(this.value)).then(() => this);
  }

  match<U>(handlers: { some: (value: T) => U; none: () => U }): U {
    return handlers.some(this.value);
  }

  fold<U>(onSome: (value: T) => U, _onNone: () => U): U {
    return onSome(this.value);
  }

  getOrElse<U>(_defaultValue: U): T | U {
    return this.value;
  }

  getOrThrow(_message?: string): T {
    return this.value;
  }

  getOrNull(): T | null {
    return this.value;
  }

  getOrUndefined(): T | undefined {
    return this.value;
  }

  get<K extends keyof T>(key: K): Maybe<T[K]> {
    return maybe(this.value[key]);
  }

  toResult<E>(_error: E): Result<T, E> {
    return ok<T, E>(this.value);
  }

  toArray(): T[] {
    return [this.value];
  }

  toIterable(): Iterable<T> {
    return [this.value];
  }

  isSome(): this is SomeImpl<T> {
    return true;
  }

  isNone(): this is NoneImpl {
    return false;
  }
}
