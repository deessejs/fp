import { describe, it, expect } from 'vitest';
import { not, and, or, type Predicate, type Refinement } from '@deessejs/fp';

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

describe('and', () => {
  it('returns true when both predicates are true', () => {
    const isPositive = (n: number) => n > 0;
    const isEven = (n: number) => n % 2 === 0;
    const isPositiveEven = and(isPositive, isEven);
    expect(isPositiveEven(2)).toBe(true);
  });

  it('returns false when the left predicate is false', () => {
    const isPositive = (n: number) => n > 0;
    const isEven = (n: number) => n % 2 === 0;
    const isPositiveEven = and(isPositive, isEven);
    expect(isPositiveEven(-2)).toBe(false);
  });

  it('returns false when the right predicate is false', () => {
    const isPositive = (n: number) => n > 0;
    const isEven = (n: number) => n % 2 === 0;
    const isPositiveEven = and(isPositive, isEven);
    expect(isPositiveEven(3)).toBe(false);
  });

  it('short-circuits — right predicate is not called when left is false', () => {
    let rightCalls = 0;
    const isPositive = (_n: number) => false;
    const isEven = (_n: number) => {
      rightCalls++;
      return true;
    };
    and(isPositive, isEven)(1);
    expect(rightCalls).toBe(0);
  });
});

describe('or', () => {
  it('returns true when the left predicate is true', () => {
    const isPositive = (n: number) => n > 0;
    const isZero = (n: number) => n === 0;
    const isNonNegative = or(isZero, isPositive);
    expect(isNonNegative(0)).toBe(true);
  });

  it('returns true when the right predicate is true', () => {
    const isPositive = (n: number) => n > 0;
    const isZero = (n: number) => n === 0;
    const isNonNegative = or(isZero, isPositive);
    expect(isNonNegative(5)).toBe(true);
  });

  it('returns false when both predicates are false', () => {
    const isPositive = (n: number) => n > 0;
    const isZero = (n: number) => n === 0;
    const isNonNegative = or(isZero, isPositive);
    expect(isNonNegative(-1)).toBe(false);
  });

  it('short-circuits — right predicate is not called when left is true', () => {
    let rightCalls = 0;
    const isPositive = (_n: number) => true;
    const isEven = (_n: number) => {
      rightCalls++;
      return true;
    };
    or(isPositive, isEven)(1);
    expect(rightCalls).toBe(0);
  });
});