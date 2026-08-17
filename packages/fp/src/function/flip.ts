/**
 * flip — swaps the first two arguments of a binary function.
 *
 * `flip(f)(a, b)` is equivalent to `f(b, a)`.
 */
export function flip<A, B, C>(fn: (a: A, b: B) => C): (b: B, a: A) => C {
  return (b: B, a: A) => fn(a, b);
}
