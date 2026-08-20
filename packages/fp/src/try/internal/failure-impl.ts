/**
 * FailureImpl — internal implementation of the Failure variant.
 *
 * Not exported. The public surface is the `Failure<T,E>` type alias
 * (in `../types.ts`) and the `failure()` factory (in
 * `../constants.ts`).
 *
 * The pass-through methods (`map`, `flatMap`, `tap`, `tapAsync`,
 * `flatMapAsync`) widen `T` to the new value type because the
 * Failure variant carries no value — the original `T` is logically
 * `never` for the consumer. We expose `T` as a parameter so the
 * discriminated union `Success<T,E> | Failure<T,E>` narrows
 * consistently (see rule 0008).
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../../result/types.js';
import type { Try } from '../types.js';
import { err } from '../../result/constants.js';
import { SuccessImpl } from './success-impl.js';

export class FailureImpl<T = never, E = never> {
  readonly _tag = 'Failure' as const;
  readonly cause: E;

  constructor(cause: E) {
    this.cause = cause;
  }

  map<B>(_fn: (value: never) => B): Try<B, E> {
    return this as unknown as FailureImpl<B, E>;
  }

  flatMap<B, E2>(_fn: (value: never) => Try<B, E2>): Try<B, E | E2> {
    return this as unknown as FailureImpl<B, E | E2>;
  }

  mapError<E2>(fn: (cause: E) => E2): FailureImpl<T, E2> {
    return new FailureImpl<T, E2>(fn(this.cause));
  }

  tap(_fn: (value: never) => unknown): FailureImpl<T, E> {
    return this;
  }

  tapAsync(_fn: (value: never) => Promise<unknown>): Promise<FailureImpl<T, E>> {
    return Promise.resolve(this);
  }

  flatMapAsync<B, E2>(_fn: (value: never) => Promise<Try<B, E2>>): Promise<FailureImpl<B, E | E2>> {
    return Promise.resolve(this as unknown as FailureImpl<B, E | E2>);
  }

  match<U>(handlers: { success: (value: never) => U; failure: (cause: E) => U }): U {
    return handlers.failure(this.cause);
  }

  fold<U>(_onSuccess: (value: never) => U, onFailure: (cause: E) => U): U {
    return onFailure(this.cause);
  }

  getOrElse<U>(defaultValue: U): T | U {
    return defaultValue;
  }

  getOrThrow(message?: string): never {
    throw new Error(message ?? String(this.cause));
  }

  getOrNull(): null {
    return null;
  }

  getOrUndefined(): undefined {
    return undefined;
  }

  toResult(): Result<T, E> {
    return err<T, E>(this.cause);
  }

  isSuccess(): this is SuccessImpl<T, never> {
    return false;
  }

  isFailure(): this is FailureImpl<T, E> {
    return true;
  }
}
