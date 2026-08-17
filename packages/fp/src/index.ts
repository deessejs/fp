/**
 * @deessejs/fp - Functional Programming Utilities for TypeScript
 *
 * @see https://fp.deessejs.com
 */

// Result exports
export type { Ok, Err, Result } from './result/types.js';
export { ok, err } from './result/constants.js';
export {
  map,
  flatMap,
  mapError,
  filter,
  tap,
  tapAsync,
  flatMapAsync,
  match,
  fold,
  getOrElse,
  getOrThrow,
  getOrNull,
  getOrUndefined,
  toMaybe,
  toOption,
  isOk,
  isErr,
} from './result/functions.js';

// Maybe exports
export type { Some, None, Maybe } from './maybe/types.js';
export { some, none, maybe } from './maybe/constants.js';
export {
  map as mapMaybe,
  flatMap as flatMapMaybe,
  filter as filterMaybe,
  filterMap,
  tap as tapMaybe,
  tapAsync as tapAsyncMaybe,
  match as matchMaybe,
  fold as foldMaybe,
  getOrElse as getOrElseMaybe,
  getOrThrow as getOrThrowMaybe,
  getOrNull as getOrNullMaybe,
  getOrUndefined as getOrUndefinedMaybe,
  get as getMaybe,
  toResult,
  toArray,
  toIterable,
  isSome,
  isNone,
} from './maybe/functions.js';

// Unit exports
export type { Unit } from './unit/types.js';
export { unit, isUnit } from './unit/constants.js';

// Type utilities
export { isResult, isMaybe } from './types.js';
export type { OkType, ErrType, SomeType } from './types.js';
