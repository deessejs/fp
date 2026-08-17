/**
 * Maybe — public type contract.
 *
 * The class implementations live in `./internal/`. They are not exported.
 * The public types are `type` aliases (rule 0012) pointing at the
 * internal classes.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 * @see rule 0012 — Prefer `type` Over `interface`.
 */

import type { SomeImpl } from './internal/some-impl.js';
import type { NoneImpl } from './internal/none-impl.js';

/**
 * Some variant of Maybe — represents a present value.
 */
export type Some<T> = SomeImpl<T>;

/**
 * None variant of Maybe — represents an absent value.
 */
export type None = NoneImpl;

/**
 * Discriminated union of Some and None.
 */
export type Maybe<T> = Some<T> | None;
