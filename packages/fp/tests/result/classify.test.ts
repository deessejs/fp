import { describe, it, expect } from 'vitest';
import { classifyError } from '@deessejs/fp';
import type { ClassificationRule, ErrorConstructor } from '@deessejs/fp';

class NetworkError extends Error {}
class TimeoutError extends Error {}
class AuthError extends Error {}

const RULES: ClassificationRule[] = [
  { error: NetworkError as ErrorConstructor, classification: 'retryable' },
  { error: TimeoutError as ErrorConstructor, classification: 'retryable' },
  { error: AuthError as ErrorConstructor, classification: 'non-retryable' },
];

describe('classifyError', () => {
  it('returns non-retryable when no rules are supplied', () => {
    expect(classifyError(new Error('boom'), [])).toBe('non-retryable');
  });

  it('matches the first applicable rule', () => {
    expect(classifyError(new NetworkError('boom'), RULES)).toBe('retryable');
    expect(classifyError(new TimeoutError('boom'), RULES)).toBe('retryable');
    expect(classifyError(new AuthError('boom'), RULES)).toBe('non-retryable');
  });

  it('returns non-retryable for an Error that matches no rule', () => {
    expect(classifyError(new Error('boom'), RULES)).toBe('non-retryable');
  });

  it('returns non-retryable for a non-Error value', () => {
    expect(classifyError('string', RULES)).toBe('non-retryable');
    expect(classifyError(null, RULES)).toBe('non-retryable');
    expect(classifyError(undefined, RULES)).toBe('non-retryable');
    expect(classifyError(42, RULES)).toBe('non-retryable');
  });

  it('respects subclass instance checks', () => {
    class ExtendedNetworkError extends NetworkError {}
    expect(classifyError(new ExtendedNetworkError('boom'), RULES)).toBe('retryable');
  });
});
