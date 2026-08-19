/**
 * retry — retry a thunk with a configurable delay strategy.
 *
 * Aligns with sindresorhus/p-retry and TanStack Pacer AsyncRetryer.
 * Strategy-as-function (not a string union) so custom strategies
 * compose trivially.
 *
 * @example
 * await retry({
 *   maxAttempts: 5,
 *   strategy: exponential({ baseMs: 100 }),
 *   shouldRetry: (e, attempt) => attempt < 3,
 *   onRetry: (e) => console.warn('retrying', e),
 * }, () => fetch(url));
 */
import { sleep } from './sleep.js';

export interface RetryConfig<E = unknown> {
  /** Maximum number of attempts. Default 5. */
  readonly maxAttempts?: number;
  /** Function returning delay in ms for attempt N (1-based). Default no delay. */
  readonly strategy?: (attempt: number) => number;
  /** Decide whether to retry. Default always retry. */
  readonly shouldRetry?: (error: E, attempt: number) => boolean;
  /** Side effect on each retry. */
  readonly onRetry?: (error: E, attempt: number) => void;
  /** Cancel any in-flight retry wait. */
  readonly signal?: AbortSignal;
}

const defaultStrategy = (_attempt: number): number => 0;

export async function retry<T, E = unknown>(
  config: RetryConfig<E>,
  thunk: () => Promise<T>,
): Promise<T> {
  const maxAttempts = config.maxAttempts ?? 5;
  const strategy = config.strategy ?? defaultStrategy;
  const shouldRetry = config.shouldRetry ?? (() => true);
  const onRetry = config.onRetry ?? (() => {});
  const signal = config.signal;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }
    try {
      return await thunk();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) break;
      if (!shouldRetry(error as E, attempt)) break;
      onRetry(error as E, attempt);
      const delay = strategy(attempt);
      if (delay > 0) await sleep(delay, { signal });
    }
  }
  throw lastError;
}