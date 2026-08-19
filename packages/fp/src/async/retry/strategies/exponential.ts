/**
 * exponential — delay strategy with exponential growth.
 *
 * Returns a function `(attempt) => delayMs`. The first attempt
 * uses `baseMs`; each subsequent attempt multiplies by `factor`
 * (default 2). `maxMs` caps the delay.
 *
 * @example
 * retry({ strategy: exponential({ baseMs: 100, factor: 2 }) }, fn)
 * // attempt 1 → 100ms, attempt 2 → 200ms, attempt 3 → 400ms
 */
export interface ExponentialOptions {
  readonly baseMs: number;
  readonly factor?: number;
  readonly maxMs?: number;
}

export function exponential(options: ExponentialOptions): (attempt: number) => number {
  const factor = options.factor ?? 2;
  const maxMs = options.maxMs ?? Number.POSITIVE_INFINITY;
  return (attempt: number): number => Math.min(options.baseMs * factor ** (attempt - 1), maxMs);
}