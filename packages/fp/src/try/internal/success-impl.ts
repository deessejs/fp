/**
 * SuccessImpl — internal implementation of the Success variant.
 *
 * Not exported. The public surface is the `Success<T,E>` type alias
 * (in `../types.ts`) and the `success()` factory (in
 * `../constants.ts`).
 *
 * `mapError` widens `E` to the new error type. The runtime shape
 * carries no error, so the cast is purely nominal (rule 0008 —
 * one cast crossing one boundary).
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Result } from '../../result/types.js';
import type { Try } from '../types.js';
import { ok } from '../../result/constants.js';
import { FailureImpl } from './failure-impl.js';

export class SuccessImpl<T, E = never> {
  readonly _tag = 'Success' as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  map<B>(fn: (value: T) => B): Try<B, E> {
    return new SuccessImpl<B, E>(fn(this.value));
  }

  flatMap<B, E2>(fn: (value: T) => Try<B, E2>): Try<B, E | E2> {
    return fn(this.value);
  }

  mapError<E2>(_fn: (cause: never) => E2): SuccessImpl<T, E2> {
    return this as unknown as SuccessImpl<T, E2>;
  }

  tap(fn: (value: T) => unknown): SuccessImpl<T, E> {
    fn(this.value);
    return this;
  }

  tapAsync(fn: (value: T) => Promise<unknown>): Promise<Try<T, E>> {
    return Promise.resolve(fn(this.value)).then(() => this);
  }

  flatMapAsync<B, E2>(fn: (value: T) => Promise<Try<B, E2>>): Promise<Try<B, E | E2>> {
    return Promise.resolve(fn(this.value));
  }

  match<U>(handlers: { success: (value: T) => U; failure: (cause: E) => U }): U {
    return handlers.success(this.value);
  }

  fold<U>(onSuccess: (value: T) => U, _onFailure: (cause: E) => U): U {
    return onSuccess(this.value);
  }

  getOrElse<U>(_defaultValue: U): T {
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

  toResult(): Result<T, E> {
    return ok<T, E>(this.value);
  }

  isSuccess(): this is SuccessImpl<T, E> {
    return true;
  }

  isFailure(): this is FailureImpl<T, E> {
    return false;
  }
}
