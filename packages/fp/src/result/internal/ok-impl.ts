/**
 * OkImpl — internal implementation of the Ok variant.
 *
 * Not exported. The public surface is the `Ok<T,E>` type alias (in
 * `./types.ts`) and the `ok()` factory (in `../constants.ts`).
 *
 * `mapError` and `filter` return `OkImpl<T, E2>` / `Result<T, E>` from
 * an `OkImpl<T, E>` instance. The widening of `E` is a single cross-
 * boundary cast (rule 0008): the runtime shape carries no error, so
 * the new error type is purely nominal.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../types.js';
import type { Maybe } from '../../maybe/types.js';
import { some } from '../../maybe/constants.js';
import { ErrImpl } from './err-impl.js';

export class OkImpl<T, E = never> {
  readonly _tag = 'Ok' as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  map<B>(fn: (value: T) => B): Result<B, E> {
    return new OkImpl<B, E>(fn(this.value));
  }

  flatMap<B, E2>(fn: (value: T) => Result<B, E2>): Result<B, E | E2> {
    return fn(this.value);
  }

  mapError<E2>(_fn: (error: never) => E2): OkImpl<T, E2> {
    return this as unknown as OkImpl<T, E2>;
  }

  filter(predicate: (value: T) => boolean, errorFn?: (value: T) => E): Result<T, E> {
    if (predicate(this.value)) return this;
    if (errorFn) return new ErrImpl<T, E>(errorFn(this.value));
    return this;
  }

  tap(fn: (value: T) => unknown): OkImpl<T, E> {
    fn(this.value);
    return this;
  }

  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Result<T, E>> {
    return Promise.resolve(fn(this.value)).then(() => this);
  }

  flatMapAsync<B, E2>(fn: (value: T) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>> {
    return Promise.resolve(fn(this.value));
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.ok(this.value);
  }

  fold<U>(onOk: (value: T) => U, _onErr: (error: E) => U): U {
    return onOk(this.value);
  }

  getOrElse(_defaultValue: T): T {
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

  toMaybe(): Maybe<T> {
    return some(this.value);
  }

  toOption(): Maybe<T> {
    return some(this.value);
  }

  isOk(): this is OkImpl<T, E> {
    return true;
  }

  isErr(): this is ErrImpl<T, E> {
    return false;
  }
}
