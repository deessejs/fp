/**
 * Result — public type contract.
 *
 * The class implementations live in `./internal/`. They are not exported.
 * The public types are `type` aliases (rule 0012) pointing at the
 * internal classes.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 * @see rule 0012 — Prefer `type` Over `interface`.
 */

import type { OkImpl } from './internal/ok-impl.js';
import type { ErrImpl } from './internal/err-impl.js';

/**
 * Ok variant of Result — represents a successful computation.
 */
export type Ok<T, E = never> = OkImpl<T, E>;

/**
 * Err variant of Result — represents a failed computation.
 */
export type Err<T = never, E = never> = ErrImpl<T, E>;

/**
 * Discriminated union of Ok and Err.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;
