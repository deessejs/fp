import { describe, it, expect } from 'vitest';
import { some, none, ok, err } from '@deessejs/fp';

describe('SomeImpl', () => {
  describe('factory', () => {
    it('carries the value and the _tag', () => {
      const s = some(10);
      expect(s.value).toBe(10);
      expect(s._tag).toBe('Some');
    });
  });

  describe('map', () => {
    it('applies the function', () => {
      expect(some(10).map((x) => x * 2).getOrNull()).toBe(20);
    });
  });

  describe('flatMap', () => {
    it('binds to a Maybe', () => {
      expect(some(10).flatMap((x) => some(x + 1)).getOrNull()).toBe(11);
    });

    it('flattens to None', () => {
      expect(some(10).flatMap(() => none).isNone()).toBe(true);
    });
  });

  describe('filter', () => {
    it('returns Some when predicate passes', () => {
      expect(some(10).filter((x) => x > 5).isSome()).toBe(true);
    });

    it('returns None when predicate fails', () => {
      expect(some(10).filter((x) => x > 100).isNone()).toBe(true);
    });
  });

  describe('filterMap', () => {
    it('keeps Some', () => {
      expect(some(10).filterMap((x) => some(x + 1)).getOrNull()).toBe(11);
    });

    it('transitions to None', () => {
      expect(some(10).filterMap(() => none).isNone()).toBe(true);
    });
  });

  describe('tap', () => {
    it('runs the side effect and returns the same Some', () => {
      let seen = 0;
      const out = some(10).tap((x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isSome()).toBe(true);
    });
  });

  describe('tapAsync', () => {
    it('awaits the side effect and returns the same Some', async () => {
      let seen = 0;
      const out = await some(10).tapAsync(async (x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isSome()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to some()', () => {
      expect(
        some(10).match({
          some: (v) => v * 2,
          none: () => 0,
        }),
      ).toBe(20);
    });
  });

  describe('fold', () => {
    it('dispatches to onSome', () => {
      expect(
        some(10).fold(
          (v) => v + 1,
          () => 0,
        ),
      ).toBe(11);
    });
  });

  describe('getOrElse', () => {
    it('returns the value', () => {
      expect(some(10).getOrElse(42)).toBe(10);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value', () => {
      expect(some(10).getOrThrow('msg')).toBe(10);
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value', () => {
      expect(some(10).getOrNull()).toBe(10);
      expect(some(10).getOrUndefined()).toBe(10);
    });
  });

  describe('get (projection)', () => {
    it('returns Some for a defined key', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(some(obj).get('name').getOrNull()).toBe('Alice');
    });

    it('returns None for a missing key', () => {
      const obj: { name?: string } = {};
      expect(some(obj).get('name').isNone()).toBe(true);
    });

    it('returns None for a key whose value is null', () => {
      const obj = { x: null as null | number };
      expect(some(obj).get('x').isNone()).toBe(true);
    });
  });

  describe('toResult', () => {
    it('produces Ok', () => {
      const r = some(10).toResult('e');
      expect(r.isOk()).toBe(true);
      if (r.isOk()) expect(r.value).toBe(10);
    });
  });

  describe('toArray / toIterable', () => {
    it('returns single-element array', () => {
      expect(some(10).toArray()).toEqual([10]);
    });

    it('returns iterable producing one value', () => {
      const out: number[] = [];
      for (const x of some(10).toIterable()) out.push(x);
      expect(out).toEqual([10]);
    });
  });

  describe('isSome / isNone', () => {
    it('isSome is true', () => {
      expect(some(10).isSome()).toBe(true);
    });

    it('isNone is false', () => {
      expect(some(10).isNone()).toBe(false);
    });
  });

  // cross-conversion sanity checks
  describe('cross-conversion', () => {
    it('chains Some → Result → Ok', () => {
      expect(some(5).toResult('e').map((n) => n + 1).getOrNull()).toBe(6);
    });

    it('returns ok / err importers', () => {
      expect(ok(1).isOk()).toBe(true);
      expect(err('e').isErr()).toBe(true);
    });
  });
});
