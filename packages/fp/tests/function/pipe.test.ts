import { describe, it, expect } from 'vitest';
import { pipe } from '@deessejs/fp';

describe('pipe', () => {
  it('returns the value when no functions are supplied', () => {
    expect(pipe(42)).toBe(42);
  });

  it('applies a single function', () => {
    expect(pipe(10, (x: number) => x * 2)).toBe(20);
  });

  it('composes two functions left-to-right', () => {
    expect(pipe(10, (x: number) => x + 1, (x: number) => x * 2)).toBe(22);
  });

  it('composes three functions', () => {
    expect(pipe('  hello  ', (s: string) => s.trim(), (s: string) => s.toUpperCase(), (s: string) => `${s}!`)).toBe(
      'HELLO!',
    );
  });

  it('composes through up to nine functions', () => {
    const add = (n: number) => (x: number) => x + n;
    const result = pipe(0, add(1), add(2), add(3), add(4), add(5), add(6), add(7), add(8), add(9));
    expect(result).toBe(45);
  });

  it('preserves the empty string and other falsy values', () => {
    expect(pipe('', (s: string) => s.length)).toBe(0);
  });
});
