/**
 * @deessejs/fp - Functional Programming Utilities for TypeScript
 *
 * @see https://fp.deessejs.com
 */

// Result exports
export type { Ok, Err, Result } from './result/types.js';
export { ok, err } from './result/constants.js';

// Maybe exports
export type { Some, None, Maybe } from './maybe/types.js';
export { some, none, maybe } from './maybe/constants.js';

// Unit exports
export type { Unit } from './unit/types.js';
export { unit, isUnit } from './unit/constants.js';

// Type utilities
export { isResult, isMaybe } from './types.js';
export type { OkType, ErrType, SomeType } from './types.js';

// Forward-looking additions are tracked in the ADR under
// docs/engineering/architecture/decisions/, not as inline TODOs.
