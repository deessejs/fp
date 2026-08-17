/**
 * Maybe module exports.
 *
 * Public API: types, factories, and pipeable functions.
 * @see rule 0014 — Functions Over Classes for Public API.
 */

export type { Some, None, Maybe } from './types.js';
export { some, none, maybe } from './constants.js';
export {
  map,
  flatMap,
  filter,
  filterMap,
  tap,
  tapAsync,
  match,
  fold,
  getOrElse,
  getOrThrow,
  getOrNull,
  getOrUndefined,
  get,
  toResult,
  toArray,
  toIterable,
  isSome,
  isNone,
} from './functions.js';
