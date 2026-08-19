import { describe, it, expect } from 'vitest';
import { not, type Predicate, type Refinement } from '@deessejs/fp';

describe('Predicate', () => {
  it('narrows the parameter type to A', () => {
    const isPositive: Predicate<number> = (n: number) => n > 0;
    expect(isPositive(1)).toBe(true);
    expect(isPositive(-1)).toBe(false);
  });
});

describe('Refinement', () => {
  it('narrows the parameter type to B in the true branch', () => {
    const isString: Refinement<unknown, string> = (a: unknown): a is string => typeof a === 'string';
    const value: unknown = 'hello';
    if (isString(value)) {
      expect(value.toUpperCase()).toBe('HELLO');
    } else {
      throw new Error('expected string');
    }
  });
});

describe('not', () => {
  it('negates a predicate', () => {
    const isPositive = (n: number) => n > 0;
    const isNotPositive = not(isPositive);
    expect(isNotPositive(1)).toBe(false);
    expect(isNotPositive(-1)).toBe(true);
    expect(isNotPositive(0)).toBe(true);
  });

  it('returns a Predicate with the same parameter type', () => {
    const isLong = (s: string) => s.length > 3;
    const isShort = not(isLong);
    expect(isShort('hi')).toBe(true);
    expect(isShort('hello')).toBe(false);
  });
});