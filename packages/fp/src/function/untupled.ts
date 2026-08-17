/**
 * untupled — inverse of `tupled`. Converts a function that takes a
 * tuple into a function that takes the tuple elements as positional
 * arguments.
 *
 * `untupled(f)(a, b)` is equivalent to `f([a, b])`.
 */
export function untupled<A extends readonly unknown[], B>(
  fn: (args: A) => B,
): (...args: A) => B {
  return (...args: A) => fn(args);
}
