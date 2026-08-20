/**
 * classifyError — match a thrown value against a list of rules and
 * return a classification for retry decisions.
 *
 * The default for an unknown error is `'non-retryable'` — the safer
 * choice. A caller that wants the opposite should add a final
 * catch-all rule.
 *
 * @see rule 0014 — Functions Over Classes for Public API.
 */

import type { ErrorClassification, ClassificationRule } from './types.js';

/**
 * Classify an error against a list of {@link ClassificationRule}
 * entries. Returns the classification of the first matching rule, or
 * `'non-retryable'` if the value is not an `Error` or no rule matches.
 *
 * @example
 * class NetworkError extends Error {}
 * class TimeoutError extends Error {}
 *
 * const kind = classifyError(err, [
 *   { error: NetworkError, classification: 'retryable' },
 *   { error: TimeoutError, classification: 'retryable' },
 * ]);
 * // kind === 'retryable' if err is a NetworkError or TimeoutError
 */
export function classifyError(
  e: unknown,
  rules: ClassificationRule[],
): ErrorClassification {
  if (!(e instanceof Error)) return 'non-retryable';
  for (const rule of rules) {
    if (e instanceof rule.error) return rule.classification;
  }
  return 'non-retryable';
}
