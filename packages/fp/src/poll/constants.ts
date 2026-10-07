/**
 * Constructors for {@link Poll} variants. Kept as functions (not
 * classes) per rule 0014.
 */

import type { Pending, Done, Failed } from './types.js';

/**
 * Wrap a state as a pending outcome. The runner will sleep for the
 * configured interval and call `step` again.
 */
export function pending<S>(state: S): Pending<S> {
  return { _tag: 'Pending', state };
}

/**
 * Wrap a final state as a successful outcome. The runner will return
 * `value` to the caller.
 */
export function done<S>(value: S): Done<S> {
  return { _tag: 'Done', value };
}

/**
 * Wrap an error as a failed outcome. The runner will surface `error`
 * to the caller.
 */
export function failed<E>(error: E): Failed<E> {
  return { _tag: 'Failed', error };
}
