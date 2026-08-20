/**
 * Result module exports.
 *
 * Public API: types, factories, pipeable functions, and the
 * wrapping helpers `fromThrowable` / `fromAsyncThrowable`.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

export type {
  Ok,
  Err,
  Result,
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

export { ok, err, fromThrowable, fromAsyncThrowable } from './constants.js';

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

export { attempt } from './attempt.js';
export { withReporting } from './reporting.js';
export { classifyError } from './classify.js';
