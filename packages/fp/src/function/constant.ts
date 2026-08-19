/**
 * constant — wraps a value into a function that ignores its argument.
 */
export function constant<A, B>(value: A): (_arg: B) => A {
  return (_arg: B) => value;
}
