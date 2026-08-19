import { describe, it, expect } from 'vitest';
import type { Lazy } from '@deessejs/fp';

describe('Lazy', () => {
  it('is a zero-argument function returning a value', () => {
    const thunk: Lazy<number> = () => 42;
    expect(thunk()).toBe(42);
  });

  it('deferred computation runs at call time', () => {
    let ran = 0;
    const thunk: Lazy<number> = () => {
      ran++;
      return ran;
    };
    expect(thunk()).toBe(1);
    expect(thunk()).toBe(2);
  });
});