/**
 * Result module exports
 */

export type { Ok, Err, Result } from './types.js';
export { ok, err } from './constants.js';
// TODO: export instance methods as pipeable functions
// export { map, flatMap, mapError, filter, tap, match, ... } from './functions.js';