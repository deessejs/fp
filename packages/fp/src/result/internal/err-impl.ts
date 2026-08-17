/**
 * ErrImpl — internal implementation of the Err variant.
 *
 * Not exported. The public surface is the `Err<T,E>` type alias (in
 * `./types.ts`) and the `err()` factory (in `../constants.ts`).
 *
 * The pass-through methods (`map`, `flatMap`, `filter`, `tap`, `tapAsync`,
 * `flatMapAsync`) widen `T` to the new value type because the Err
 * variant carries no value — the original `T` is logically
 * `never` for the consumer. We expose `T` as a parameter so that the
 * discriminated union `Ok<T,E> | Err<T,E>` narrows consistently.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../types.js';
import type { Maybe } from '../../maybe/types.js';
import { none } from '../../maybe/constants.js';
import { OkImpl } from './ok-impl.js';

export class ErrImpl<T = never, E = never> {
  readonly _tag = 'Err' as const;
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  map<B>(_fn: (value: never) => B): Result<B, E> {
    return this as unknown as ErrImpl<B, E>;
  }

  flatMap<B, E2>(_fn: (value: never) => Result<B, E2>): Result<B, E | E2> {
    return this as unknown as ErrImpl<B, E | E2>;
  }

  mapError<E2>(fn: (error: E) => E2): ErrImpl<T, E2> {
    return new ErrImpl<T, E2>(fn(this.error));
  }

  filter(_predicate: (value: never) => boolean, _errorFn?: (value: never) => E): ErrImpl<T, E> {
    return this;
  }

  tap(_fn: (value: never) => unknown): ErrImpl<T, E> {
    return this;
  }

  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<ErrImpl<T, E>> {
    return Promise.resolve(this);
  }

  flatMapAsync<B, E2>(_fn: (value: never) => Promise<Result<B, E2>>): Promise<Result<B, E | E2>> {
    return Promise.resolve(this as unknown as ErrImpl<B, E | E2>);
  }

  match<U>(handlers: { ok: (value: never) => U; err: (error: E) => U }): U {
    return handlers.err(this.error);
  }

  fold<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U {
    return onErr(this.error);
  }

  getOrElse<U>(defaultValue: U): T | U {
    return defaultValue;
  }

  getOrThrow(message?: string): never {
    throw new Error(message ?? String(this.error));
  }

  getOrNull(): null {
    return null;
  }

  getOrUndefined(): undefined {
    return undefined;
  }

  toMaybe(): Maybe<T> {
    return none;
  }

  toOption(): Maybe<T> {
    return none;
  }

  isOk(): this is OkImpl<T, E> {
    return false;
  }

  isErr(): this is ErrImpl<T, E> {
    return true;
  }
}
