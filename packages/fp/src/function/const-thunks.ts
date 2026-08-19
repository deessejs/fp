/**
 * Constant thunks — functions that ignore their arguments and return a
 * fixed value of a primitive type.
 *
 * Useful in pipes and filter chains where a boolean thunk is required.
 */

/** Thunk that returns `true`. */
export const constTrue = (): boolean => true;

/** Thunk that returns `false`. */
export const constFalse = (): boolean => false;

/** Thunk that returns `null`. */
export const constNull = (): null => null;

/** Thunk that returns `undefined`. */
export const constUndefined = (): undefined => undefined;

/** Thunk that returns `void`. */
export const constVoid = (): void => undefined;