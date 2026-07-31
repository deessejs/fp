/**
 * @deessejs/fp - Functional Programming Utilities for TypeScript
 *
 * @see https://fp.deessejs.com
 */

// Result exports
export type { Ok, Err, Result } from './result/types.js';
export { ok, err } from './result/constants.js';
// TODO: pipeable functions
// export { map, flatMap, mapError, filter, tap, match, ... } from './result/functions.js';

// Maybe exports
export type { Some, None, Maybe } from './maybe/types.js';
export { some, none, maybe } from './maybe/constants.js';
// TODO: pipeable functions
// export { map, flatMap, filter, filterMap, tap, match, ... } from './maybe/functions.js';

// Unit exports
export type { Unit } from './unit/types.js';
export { unit, isUnit } from './unit/constants.js';

// Type utilities
export { isResult, isMaybe } from './types.js';
export type { OkType, ErrType, SomeType } from './types.js';

// TODO: pipe utility
// export { pipe } from './pipe.js';

// TODO: Async utilities
// export { try_, tryPromise } from './try.js';
// export { sleep, retry, timeout, queue, jitter } from './async.js';
// export { collect, first, last, mapAsync, filterAsync } from './async-iterator.js';

// TODO: Collection types
// export { Context, Sequence, Collection } from './collection.js';

// TODO: Generator composition
// export { gen } from './generator.js';

// TODO: Serialization
// export { serialize, deserialize, partition } from './serialization.js';

// TODO: Predicates
// export { Predicate, Refinement, not, and, or } from './predicate.js';