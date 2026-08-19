/**
 * FunctionN — an N-ary function from a tuple of arguments to a value.
 *
 * `@since 2.0.0` in fp-ts.
 *
 * @example
 * type Sum = FunctionN<[number, number], number>;
 * const sum: Sum = (a, b) => a + b;
 */
export type FunctionN<A extends ReadonlyArray<unknown>, B> = (...args: A) => B;