/**
 * NoneImpl — internal implementation of the None variant.
 *
 * Not exported. The single instance is exposed publicly through the
 * `none` constant. There is no public constructor — the `NONE` static
 * is the only NoneImpl that ever exists.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../../result/types.js';
import { err } from '../../result/constants.js';
import type { Maybe } from '../types.js';
import type { SomeImpl } from './some-impl.js';

export class NoneImpl {
  readonly _tag = 'None' as const;

  static readonly NONE = new NoneImpl();

  private constructor() {}

  map<B>(_fn: (value: never) => B): Maybe<B> {
    return this;
  }

  flatMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B> {
    return this;
  }

  filter(_predicate: (value: never) => boolean): Maybe<never> {
    return this;
  }

  filterMap<B>(_fn: (value: never) => Maybe<B>): Maybe<B> {
    return this;
  }

  tap(_fn: (value: never) => unknown): Maybe<never> {
    return this;
  }

  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<Maybe<never>> {
    return Promise.resolve(this);
  }

  match<U>(handlers: { some: (value: never) => U; none: () => U }): U {
    return handlers.none();
  }

  fold<U>(_onSome: (value: never) => U, onNone: () => U): U {
    return onNone();
  }

  getOrElse<U>(defaultValue: U): never | U {
    return defaultValue;
  }

  getOrThrow(message?: string): never {
    throw new Error(message ?? 'Expected Some but got None');
  }

  getOrNull(): null {
    return null;
  }

  getOrUndefined(): undefined {
    return undefined;
  }

  get(_key: PropertyKey): Maybe<never> {
    return this;
  }

  toResult<E>(error: E): Result<never, E> {
    return err<never, E>(error);
  }

  toArray(): [] {
    return [];
  }

  toIterable(): Iterable<never> {
    return [];
  }

  isSome(): this is SomeImpl<never> {
    return false;
  }

  isNone(): this is NoneImpl {
    return true;
  }
}
