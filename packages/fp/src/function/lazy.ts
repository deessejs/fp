/**
 * Lazy — a thunk. A function that takes no arguments and returns a value.
 *
 * Used to defer computation: `Lazy<A> = () => A`.
 */
export type Lazy<A> = () => A;