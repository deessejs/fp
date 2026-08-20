/**
 * AttemptImpl — internal implementation of {@link Attempt}.
 *
 * Not exported. The public surface is the `Attempt<T>` type alias
 * (in `../types.ts`) and the `attempt()` factory (in
 * `../attempt.ts`).
 *
 * Holds the {@link AttemptConfig} so that `execute()` and
 * `clientSafe()` can capture and run the supplied `onSuccess` on
 * demand. Construction is lazy: `attempt()` returns the wrapper
 * without invoking `onSuccess`. Each call to `execute()` /
 * `clientSafe()` runs `onSuccess` afresh.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from '../../result/constants.js';
import type { Result } from '../../result/types.js';
import type {
  Attempt,
  AttemptConfig,
  NormalizedError,
  RetryConfig,
} from '../types.js';

/**
 * Default {@link NormalizedError} used when `clientSafe()` must hide
 * a raw cause behind a generic 500.
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
 * `normalize` runs first if supplied; otherwise the raw cause is
 * hidden behind `DEFAULT_NORMALIZED`. If `normalize` returns a value
 * that does not already match the `NormalizedError` shape, the
 * function falls back to the default.
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
 * True when the configured retry policy allows a re-attempt.
 * Returns `false` when no retry config is supplied.
 */
function shouldRetry(cause: unknown, retry: RetryConfig<unknown> | undefined): boolean {
  if (!retry || !retry.shouldRetry) return false;
  return retry.shouldRetry(cause);
}

export class AttemptImpl<T> implements Attempt<T> {
  private readonly config: AttemptConfig<T>;

  constructor(config: AttemptConfig<T>) {
    this.config = config;
  }

  async execute(): Promise<Result<T, unknown>> {
    try {
      const value = await this.config.onSuccess();
      return ok<T, unknown>(value);
    } catch (cause) {
      if (shouldRetry(cause, this.config.retry)) {
        try {
          const value = await this.config.onSuccess();
          return ok<T, unknown>(value);
        } catch (cause2) {
          return err<T, unknown>(this.config.normalize ? this.config.normalize(cause2) : cause2);
        }
      }
      return err<T, unknown>(this.config.normalize ? this.config.normalize(cause) : cause);
    }
  }

  async clientSafe(): Promise<Result<T, NormalizedError>> {
    try {
      const value = await this.config.onSuccess();
      return ok<T, NormalizedError>(value);
    } catch (cause) {
      return err<T, NormalizedError>(toNormalized(cause, this.config.normalize));
    }
  }
}
