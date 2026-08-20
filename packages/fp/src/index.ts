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

// Function utilities
export {
  pipe,
  flow,
  compose,
  identity,
  constant,
  flip,
  tupled,
  untupled,
  tuple,
  not,
  and,
  or,
  constTrue,
  constFalse,
  constNull,
  constUndefined,
  constVoid,
} from './function/index.js';

export type { Lazy, Predicate, Refinement, Endomorphism, FunctionN } from './function/index.js';

// Try exports
export type {
  Success,
  Failure,
  Try,
  UnhandledException,
  AttemptConfig,
  Attempt,
  NormalizedError,
  RetryConfig,
  DelayStrategy,
  ErrorReporter,
  ErrorContext,
  ReportableError,
  ErrorClassification,
  ClassificationRule,
  ErrorConstructor,
} from './try/types.js';
export { success, failure, try_, tryPromise } from './try/constants.js';
export {
  map as mapTry,
  flatMap as flatMapTry,
  mapError as mapErrorTry,
  tap as tapTry,
  tapAsync as tapAsyncTry,
  flatMapAsync as flatMapAsyncTry,
  match as matchTry,
  fold as foldTry,
  getOrElse as getOrElseTry,
  getOrThrow as getOrThrowTry,
  getOrNull as getOrNullTry,
  getOrUndefined as getOrUndefinedTry,
  toResult as toResultTry,
  isSuccess,
  isFailure,
} from './try/functions.js';
export { attempt, withReporting, classifyError } from './try/index.js';

// Type utilities
export { isResult, isMaybe } from './types.js';
export type { OkType, ErrType, SomeType } from './types.js';

// Forward-looking additions are tracked in the ADR under
// docs/engineering/architecture/decisions/, not as inline TODOs.
