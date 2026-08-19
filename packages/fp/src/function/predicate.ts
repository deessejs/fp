/**
 * Predicate — a function from `A` to `boolean`.
 */
export type Predicate<A> = (a: A) => boolean;

/**
 * Refinement — a `Predicate` that narrows its argument to `B`.
 *
 * Behaves as a type guard: `(a: A) => a is B`.
 */
export type Refinement<A, B extends A> = (a: A) => a is B;

/**
 * not — negates a `Predicate`.
 */
export function not<A>(predicate: Predicate<A>): Predicate<A> {
  return (a: A) => !predicate(a);
}