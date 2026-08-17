import { describe, it, expect } from 'vitest';
import { constant } from '@deessejs/fp';

describe('constant', () => {
  it('returns the wrapped value regardless of the argument', () => {
    const k = constant(42);
    expect(k(0)).toBe(42);
    expect(k('whatever')).toBe(42);
    expect(k(null)).toBe(42);
  });

  it('wraps an object reference', () => {
    const obj = { a: 1 };
    const k = constant(obj);
    expect(k('x')).toBe(obj);
  });

  it('returns the same value across many calls', () => {
    const k = constant('hello');
    expect(k(1)).toBe('hello');
    expect(k(2)).toBe('hello');
    expect(k(3)).toBe('hello');
  });
});
