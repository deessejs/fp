/**
 * Try module exports.
 *
 * Public API: types, factories, pipeable functions, and the
 * higher-level helpers `attempt`, `withReporting`, `classifyError`.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

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
} from './types.js';

export { success, failure, try_, tryPromise } from './constants.js';

export {
  map,
  flatMap,
  mapError,
  tap,
  tapAsync,
  flatMapAsync,
  match,
  fold,
  getOrElse,
  getOrThrow,
  getOrNull,
  getOrUndefined,
  toResult,
  isSuccess,
  isFailure,
} from './functions.js';

export { attempt } from './attempt.js';
export { withReporting } from './reporting.js';
export { classifyError } from './classify.js';
