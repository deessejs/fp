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
 * Construction is lazy. `attempt()` does not invoke `onSuccess`;
 * the wrapped operation runs only when `execute()` or `clientSafe()`
 * is called. `config.retry` is consulted for a single re-attempt
 * when `shouldRetry(cause)` returns `true`. A retry loop is
 * intentionally out of scope here — the `DelayStrategy` type ships
 * for forward compatibility, but no delay calculator is implemented
 * yet.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { Attempt, AttemptConfig } from './types.js';
import { AttemptImpl } from './internal/attempt-impl.js';

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
  return new AttemptImpl<T>(config);
}
