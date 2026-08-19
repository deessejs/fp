/**
 * constantDelay — fixed delay between attempts.
 *
 * Renamed `constantDelay` to avoid collision with the
 * `constant<A, B>` value factory from `function/`.
 */
export interface ConstantDelayOptions {
  readonly delayMs: number;
}

export function constantDelay(options: ConstantDelayOptions): (_attempt: number) => number {
  return (): number => options.delayMs;
}