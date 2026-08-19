/**
 * tuple — typed identity function for tuple literals.
 *
 * Forces TypeScript to infer a tuple type (with literal narrowing) instead
 * of widening to an array. Equivalent to `as const` but ergonomic.
 *
 * @example
 * const point = tuple(1, 2); // readonly [1, 2] instead of number[]
 */
export function tuple<T extends ReadonlyArray<unknown>>(...t: T): T {
  return t;
}