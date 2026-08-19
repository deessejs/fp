/**
 * jitter — randomises a delay strategy to prevent thundering herd.
 *
 * `jitter(strategy, { amplitude: 0.5 })` adds a random offset in
 * `[0, strategy(attempt) * amplitude]` to the base delay.
 *
 * @example
 * retry({ strategy: jitter(exponential({ baseMs: 100 })) }, fn)
 */
export interface JitterOptions {
  /**
   * Maximum proportion of the base delay to add as random jitter.
   * 0 means no jitter, 1 means up to 100% extra. Default 0.5.
   */
  readonly amplitude?: number;
}

export function jitter(
  strategy: (attempt: number) => number,
  options?: JitterOptions,
): (attempt: number) => number {
  const amplitude = options?.amplitude ?? 0.5;
  return (attempt: number): number => {
    const base = strategy(attempt);
    return base + base * amplitude * Math.random();
  };
}