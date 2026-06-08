/**
 * @deessejs/fp - Functional Programming Utilities for TypeScript
 *
 * @see https://fp.deessejs.com
 */

// Result exports
export type { Ok, Err, Result } from './result/types';
export { ok, err } from './result/constants';
// TODO: pipeable functions
// export { map, flatMap, mapError, filter, tap, match, ... } from './result/functions';

// Maybe exports
export type { Some, None, Maybe } from './maybe/types';
export { some, none, maybe } from './maybe/constants';
// TODO: pipeable functions
// export { map, flatMap, filter, filterMap, tap, match, ... } from './maybe/functions';

// Unit exports
export type { Unit } from './unit/types';
export { unit, isUnit } from './unit/constants';

// Type utilities
export { isResult, isMaybe } from './types';
export type { OkType, ErrType, SomeType } from './types';

// TODO: pipe utility
// export { pipe } from './pipe';

// TODO: Async utilities
// export { try_, tryPromise } from './try';
// export { sleep, retry, timeout, queue, jitter } from './async';
// export { collect, first, last, mapAsync, filterAsync } from './async-iterator';

// TODO: Collection types
// export { Context, Sequence, Collection } from './collection';

// TODO: Generator composition
// export { gen } from './generator';

// TODO: Serialization
// export { serialize, deserialize, partition } from './serialization';

// TODO: Predicates
// export { Predicate, Refinement, not, and, or } from './predicate';