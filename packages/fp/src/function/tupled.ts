/**
 * tupled — converts a function whose first argument is a tuple into a
 * function that takes the tuple as a single argument.
 *
 * `tupled(f)([a, b])` is equivalent to `f(a, b)`.
 */
export function tupled<A extends readonly unknown[], B>(
  fn: (...args: A) => B,
): (args: A) => B {
  return (args: A) => fn(...args);
}
