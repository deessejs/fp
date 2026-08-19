import { describe, it, expect } from 'vitest';
import { compose, flow } from '@deessejs/fp';

describe('compose', () => {
  it('returns a function that applies a single step', () => {
    const f = compose((x: number) => x * 2);
    expect(f(10)).toBe(20);
  });

  it('composes two functions right-to-left', () => {
    // compose(g, f)(x) === g(f(x))
    const f = compose((x: number) => x + 1, (x: number) => x * 2);
    expect(f(10)).toBe(21);
  });

  it('composes three functions right-to-left', () => {
    const f = compose(
      (s: string) => `!${s}!`,
      (s: string) => s.toUpperCase(),
      (s: string) => s.trim(),
    );
    expect(f('  hello  ')).toBe('!HELLO!');
  });

  it('composes through up to nine functions', () => {
    const add = (n: number) => (x: number) => x + n;
    const f = compose(add(9), add(8), add(7), add(6), add(5), add(4), add(3), add(2), add(1));
    expect(f(0)).toBe(45);
  });

  it('is the mirror of flow', () => {
    const add = (n: number) => (x: number) => x + n;
    const c = compose(add(1), add(2), add(3));
    const f = flow(add(3), add(2), add(1));
    expect(c(0)).toBe(f(0));
  });
});