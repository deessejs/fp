import { describe, it, expect } from 'vitest';
import { tupled, untupled } from '@deessejs/fp';

describe('tupled', () => {
  it('packs positional arguments into a tuple', () => {
    const fn = (a: number, b: number) => a + b;
    const t = tupled(fn);
    expect(t([1, 2])).toBe(3);
  });

  it('works with three arguments', () => {
    const fn = (a: number, b: number, c: number) => a + b + c;
    const t = tupled(fn);
    expect(t([1, 2, 3])).toBe(6);
  });

  it('works with heterogeneous types', () => {
    const fn = (a: string, b: number, c: boolean) => `${a}-${b}-${c}`;
    const t = tupled(fn);
    expect(t(['x', 1, true])).toBe('x-1-true');
  });
});

describe('untupled', () => {
  it('unpacks a tuple into positional arguments', () => {
    const fn = (pair: readonly [number, number]) => pair[0] + pair[1];
    const u = untupled(fn);
    expect(u(1, 2)).toBe(3);
  });

  it('works with three arguments', () => {
    const fn = (triple: readonly [number, number, number]) => triple[0] + triple[1] + triple[2];
    const u = untupled(fn);
    expect(u(1, 2, 3)).toBe(6);
  });
});

describe('tupled / untupled inverses', () => {
  it('untupled(tupled(f)) is callable with positional args', () => {
    const f = (a: number, b: number) => `${a}:${b}`;
    const round = untupled(tupled(f));
    expect(round(1, 2)).toBe('1:2');
  });

  it('tupled(untupled(f)) is callable with a tuple', () => {
    const f = (pair: readonly [number, number]) => pair[0] + pair[1];
    const round = tupled(untupled(f));
    expect(round([1, 2])).toBe(3);
  });
});
