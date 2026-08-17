/**
 * Result module exports.
 *
 * Public API: types, factories, and pipeable functions.
 * @see rule 0014 — Functions Over Classes for Public API.
 */

export type { Ok, Err, Result } from './types.js';
export { ok, err } from './constants.js';
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
} from './functions.js';
