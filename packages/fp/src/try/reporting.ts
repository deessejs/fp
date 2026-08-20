/**
 * withReporting — wrap a throwing operation so that any caught
 * error is forwarded to a caller-supplied {@link ErrorReporter} and
 * the operation's outcome is returned as a `Result<T,
 * ReportableError>`.
 *
 * The reporter always sees the original thrown value, never the
 * wrapper. The `Result` carries a {@link ReportableError} that
 * preserves the cause for debugging while exposing a flat `message`
 * for callers.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import { ok, err } from '../result/constants.js';
import type { Result } from '../result/types.js';
import type { ErrorReporter, ErrorContext, ReportableError } from './types.js';

/**
 * Wrap a sync or async operation in error reporting.
 *
 * The reporter is invoked exactly once when the operation throws,
 * with the original thrown value and an {@link ErrorContext} carrying
 * the current timestamp, the operation name, and any caller-supplied
 * metadata.
 *
 * @example
 * const reporter: ErrorReporter = {
 *   report(e, ctx) { metrics.increment('error', { op: ctx.operation }); },
 * };
 *
 * await withReporting(
 *   () => processPayment(order),
 *   'processPayment',
 *   reporter,
 *   { orderId: order.id },
 * );
 */
export async function withReporting<T>(
  onSuccess: () => T | Promise<T>,
  operationName: string,
  reporter: ErrorReporter,
  metadata?: Readonly<Record<string, unknown>>,
): Promise<Result<T, ReportableError>> {
  const context: ErrorContext = {
    timestamp: Date.now(),
    operation: operationName,
    metadata,
  };
  try {
    const value = await onSuccess();
    return ok<T, ReportableError>(value);
  } catch (cause) {
    reporter.report(cause, context);
    const reported: ReportableError = {
      _tag: 'ReportableError',
      message: cause instanceof Error ? cause.message : 'Operation failed',
      cause,
    };
    return err<T, ReportableError>(reported);
  }
}
