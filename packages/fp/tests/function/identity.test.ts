import { describe, it, expect } from 'vitest';
import { identity } from '@deessejs/fp';

describe('identity', () => {
  it('returns its argument', () => {
    expect(identity(1)).toBe(1);
  });

  it('returns strings unchanged', () => {
    expect(identity('hello')).toBe('hello');
  });

  it('returns the same object reference', () => {
    const obj = { a: 1 };
    expect(identity(obj)).toBe(obj);
  });

  it('returns null', () => {
    expect(identity(null)).toBe(null);
  });

  it('returns undefined', () => {
    expect(identity(undefined)).toBe(undefined);
  });
});
