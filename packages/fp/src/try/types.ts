/**
 * Try — public type contract.
 *
 * The class implementations live in `./internal/`. They are not exported.
 * The public types are `type` aliases (rule 0012) pointing at the
 * internal classes.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 * @see rule 0012 — Prefer `type` Over `interface`.
 */

import type { SuccessImpl } from './internal/success-impl.js';
import type { FailureImpl } from './internal/failure-impl.js';

/**
 * Success variant of Try — a synchronous or asynchronous computation
 * that completed without throwing.
 */
export type Success<T, E = never> = SuccessImpl<T, E>;

/**
 * Failure variant of Try — a synchronous or asynchronous computation
 * that threw. The captured `cause` is the value passed to `onError`
 * (or wrapped in {@link UnhandledException} when no mapper is given).
 */
export type Failure<T = never, E = never> = FailureImpl<T, E>;

/**
 * Discriminated union of Success and Failure.
 *
 * Models a computation that may throw, without forcing callers to
 * use a `try`/`catch` block. The error is a value of type `E`, not
 * a JavaScript exception.
 */
export type Try<T, E> = Success<T, E> | Failure<T, E>;

/**
 * Wrapper placed in the `cause` field of a {@link Failure} when a
 * throwing function is wrapped with the thunk-only overload of
 * `try_` / `tryPromise` (no `onError` mapper supplied).
 */
export interface UnhandledException {
  readonly _tag: 'UnhandledException';
  readonly cause: unknown;
}

/**
 * Configuration passed to {@link attempt}.
 *
 * `client` toggles whether `execute()` normalises errors against the
 * configured `normalize` function before producing a {@link Result}.
 * `retry` is reserved for forward compatibility with a future retry
 * helper; the current implementation performs at most one re-attempt
 * when `retry.shouldRetry(cause)` returns `true`.
 */
export interface AttemptConfig<T> {
  readonly onSuccess: () => T | Promise<T>;
  readonly client?: boolean;
  readonly retry?: RetryConfig<unknown>;
  readonly normalize?: (e: unknown) => unknown;
}

/**
 * The object returned by {@link attempt}.
 *
 * - `execute()` returns a {@link Result} carrying the original
 *   (possibly normalised) error.
 * - `clientSafe()` returns a {@link Result} where every error is
 *   mapped to a {@link NormalizedError} safe for HTTP responses.
 */
export interface Attempt<T> {
  execute(): Promise<Result<T, unknown>>;
  clientSafe(): Promise<Result<T, NormalizedError>>;
}

/**
 * Error shape safe for exposing to a public-facing client.
 *
 * Built by `clientSafe()` from any thrown value. The `public` flag
 * distinguishes errors that are intentionally surfaced (4xx) from
 * errors that escaped and should be hidden behind a 500.
 */
export interface NormalizedError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly public: boolean;
}

/**
 * Retry configuration. Reserved for forward compatibility with a
 * future retry helper. The current implementation only inspects
 * `shouldRetry` and performs at most one re-attempt inside
 * {@link attempt}.
 */
export interface RetryConfig<E> {
  readonly attempts: number;
  readonly delay: DelayStrategy;
  readonly onRetry?: (error: E, attempt: number) => void;
  readonly shouldRetry?: (error: E) => boolean;
}

/**
 * Tagged union describing a delay schedule. Reserved for forward
 * compatibility — no delay helper is shipped yet.
 */
export type DelayStrategy =
  | { readonly kind: 'exponential'; readonly baseMs: number }
  | { readonly kind: 'linear'; readonly baseMs: number }
  | { readonly kind: 'constant'; readonly baseMs: number };

/**
 * Pluggable sink for error events. Used by {@link withReporting}.
 */
export interface ErrorReporter {
  report(error: unknown, context: ErrorContext): void;
}

/**
 * Metadata attached to a reported error event.
 */
export interface ErrorContext {
  readonly timestamp: number;
  readonly operation: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Structured error returned by {@link withReporting} when the wrapped
 * operation throws. The original cause is preserved in the `cause`
 * field for debugging, while `message` carries a flat string safe to
 * render to a caller.
 */
export interface ReportableError {
  readonly _tag: 'ReportableError';
  readonly message: string;
  readonly cause?: unknown;
}

/**
 * Outcome of {@link classifyError}. `'retryable'` means the
 * caller should attempt the operation again; `'non-retryable'`
 * means the caller should propagate the error.
 */
export type ErrorClassification = 'retryable' | 'non-retryable';

/**
 * One entry in the rule list passed to {@link classifyError}.
 *
 * `error` is matched against the thrown value with `instanceof`.
 */
export interface ClassificationRule {
  readonly error: ErrorConstructor;
  readonly classification: ErrorClassification;
}

/**
 * TypeScript-friendly `Error` constructor type. Use it for fields
 * that name an `Error` subclass by reference (e.g. in
 * {@link ClassificationRule}).
 *
 * The parameter list is `unknown[]` because the runtime never
 * instantiates these constructors — it only matches existing
 * instances with `instanceof`. `unknown[]` is wider than the
 * standard `any[]` and satisfies the project's lint policy without
 * weakening the public contract.
 */
export type ErrorConstructor = abstract new (...args: unknown[]) => Error;

// Local re-import of Result so the public types compile even when the
// module is consumed in isolation. The runtime symbol is referenced
// from `functions.ts` and `attempt.ts`.
import type { Result } from '../result/types.js';
