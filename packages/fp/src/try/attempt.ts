/**
 * attempt — higher-level wrapper that captures thrown values into a
 * {@link Result}.
 *
 * Returns an {@link Attempt} exposing two methods:
 *
 * - `execute()` returns `Result<T, unknown>`; the error is the
 *   original thrown value, optionally run through the caller-supplied
 *   `normalize` function.
 * - `clientSafe()` returns `Result<T, NormalizedError>`; the error is
 *   always coerced into a {@link NormalizedError} suitable for an
 *   HTTP response.
 *
 * `config.retry` is consulted for a single re-attempt when
 * `shouldRetry(cause)` returns `true`. A retry loop is intentionally
 * out of scope here — the `DelayStrategy` type ships for forward
 * compatibility, but no delay calculator is implemented yet.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from '../result/constants.js';
import type { Attempt, AttemptConfig, NormalizedError, RetryConfig } from './types.js';

/**
 * Default {@link NormalizedError} used when the caller does not
 * supply a `normalize` mapper and `clientSafe()` must hide the raw
 * cause from the client.
 */
const DEFAULT_NORMALIZED: NormalizedError = {
  code: 'INTERNAL_ERROR',
  message: 'An unexpected error occurred',
  status: 500,
  public: false,
};

/**
 * Map a thrown value to a {@link NormalizedError}.
 *
 * If `normalize` is supplied it runs first; otherwise the raw cause
 * is hidden behind `DEFAULT_NORMALIZED`. If `normalize` returns
 * something that is not already a `NormalizedError`, the function
 * shapes the return value into one with safe defaults.
 */
function toNormalized(
  cause: unknown,
  normalize: ((e: unknown) => unknown) | undefined,
): NormalizedError {
  const raw = normalize ? normalize(cause) : cause;
  if (
    raw !== null &&
    typeof raw === 'object' &&
    typeof (raw as { code?: unknown }).code === 'string' &&
    typeof (raw as { message?: unknown }).message === 'string' &&
    typeof (raw as { status?: unknown }).status === 'number' &&
    typeof (raw as { public?: unknown }).public === 'boolean'
  ) {
    return raw as NormalizedError;
  }
  return DEFAULT_NORMALIZED;
}

/**
 * True when the configured retry policy allows a re-attempt. Returns
 * `false` when no retry config is supplied.
 */
function shouldRetry(cause: unknown, retry: RetryConfig<unknown> | undefined): boolean {
  if (!retry || !retry.shouldRetry) return false;
  return retry.shouldRetry(cause);
}

/**
 * Create a configured {@link Attempt}.
 *
 * @example
 * const getConfig = attempt({
 *   onSuccess: () => fetch('/api/config').then(r => r.json()),
 *   normalize: (e) => e instanceof Error ? e.message : 'unknown',
 * });
 *
 * const result = await getConfig.execute();
 * const safe   = await getConfig.clientSafe();
 */
export function attempt<T>(config: AttemptConfig<T>): Attempt<T> {
  return {
    execute: async () => {
      try {
        const value = await config.onSuccess();
        return ok<T, unknown>(value);
      } catch (cause) {
        if (shouldRetry(cause, config.retry)) {
          try {
            const value = await config.onSuccess();
            return ok<T, unknown>(value);
          } catch (cause2) {
            return err<T, unknown>(config.normalize ? config.normalize(cause2) : cause2);
          }
        }
        return err<T, unknown>(config.normalize ? config.normalize(cause) : cause);
      }
    },
    clientSafe: async () => {
      try {
        const value = await config.onSuccess();
        return ok<T, NormalizedError>(value);
      } catch (cause) {
        return err<T, NormalizedError>(toNormalized(cause, config.normalize));
      }
    },
  };
}
