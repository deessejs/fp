import { describe, it, expect } from 'vitest';
import { flow } from '@deessejs/fp';

describe('flow', () => {
  it('returns a function that applies a single step', () => {
    const double = flow((x: number) => x * 2);
    expect(double(10)).toBe(20);
  });

  it('composes two functions left-to-right', () => {
    const fn = flow((x: number) => x + 1, (x: number) => x * 2);
    expect(fn(10)).toBe(22);
  });

  it('composes up to nine functions', () => {
    const add = (n: number) => (x: number) => x + n;
    const fn = flow(add(1), add(2), add(3), add(4), add(5), add(6), add(7), add(8), add(9));
    expect(fn(0)).toBe(45);
  });

  it('returns a reusable function', () => {
    const slugify = flow(
      (s: string) => s.trim(),
      (s: string) => s.toLowerCase(),
      (s: string) => s.replace(/\s+/g, '-'),
    );
    expect(slugify('  Hello World  ')).toBe('hello-world');
    expect(slugify('  Foo  Bar  Baz  ')).toBe('foo-bar-baz');
  });
});
