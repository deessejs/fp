import { describe, it, expect } from 'vitest';
import { flip } from '@deessejs/fp';

describe('flip', () => {
  it('swaps the first two arguments', () => {
    const divide = (a: number, b: number) => a / b;
    const flipped = flip(divide);
    expect(flipped(2, 10)).toBe(5);
  });

  it('works with string concatenation', () => {
    const concat = (a: string, b: string) => `${a}-${b}`;
    const flipped = flip(concat);
    expect(flipped('world', 'hello')).toBe('hello-world');
  });

  it('preserves the result type', () => {
    const fn = (a: number, b: number) => a + b;
    const flipped = flip(fn);
    const result: number = flipped(2, 3);
    expect(result).toBe(5);
  });
});
