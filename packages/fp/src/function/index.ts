/**
 * Function utilities — public module exports.
 */

export { pipe } from './pipe.js';
export { flow } from './flow.js';
export { compose } from './compose.js';
export { identity } from './identity.js';
export { constant } from './constant.js';
export { flip } from './flip.js';
export { tupled } from './tupled.js';
export { untupled } from './untupled.js';
export { tuple } from './tuple.js';
export { not } from './predicate.js';
export { constTrue, constFalse, constNull, constUndefined, constVoid } from './const-thunks.js';

export type { Lazy } from './lazy.js';
export type { Predicate, Refinement } from './predicate.js';
export type { Endomorphism } from './endomorphism.js';
export type { FunctionN } from './function-n.js';