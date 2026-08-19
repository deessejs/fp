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

/**
 * and — short-circuit logical AND of two predicates.
 *
 * Equivalent to `(a) => left(a) && right(a)`.
 */
export function and<A>(left: Predicate<A>, right: Predicate<A>): Predicate<A> {
  return (a: A) => left(a) && right(a);
}

/**
 * or — short-circuit logical OR of two predicates.
 *
 * Equivalent to `(a) => left(a) || right(a)`.
 */
export function or<A>(left: Predicate<A>, right: Predicate<A>): Predicate<A> {
  return (a: A) => left(a) || right(a);
}