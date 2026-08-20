import { describe, it, expect } from 'vitest';
import { tuple } from '@deessejs/fp';

describe('tuple', () => {
  it('returns its arguments as a tuple', () => {
    expect(tuple(1, 2, 3)).toEqual([1, 2, 3]);
  });

  it('preserves empty tuple', () => {
    expect(tuple()).toEqual([]);
  });

  it('returns the same tuple on a single element', () => {
    expect(tuple('a')).toEqual(['a']);
  });
});