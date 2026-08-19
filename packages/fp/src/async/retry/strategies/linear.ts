/**
 * linear — delay strategy with linear growth.
 *
 * Returns a function `(attempt) => delayMs`. Each subsequent
 * attempt adds `stepMs` to the delay.
 */
export interface LinearOptions {
  readonly stepMs: number;
  readonly maxMs?: number;
}

export function linear(options: LinearOptions): (attempt: number) => number {
  const maxMs = options.maxMs ?? Number.POSITIVE_INFINITY;
  return (attempt: number): number => Math.min(attempt * options.stepMs, maxMs);
}