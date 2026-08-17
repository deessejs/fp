import { describe, it, expect } from 'vitest';
import { none, maybe, some } from '@deessejs/fp';

describe('NoneImpl', () => {
  describe('factory', () => {
    it('produces a singleton identity', () => {
      expect(none).toBe(none);
    });

    it('carries the _tag discriminator', () => {
      expect(none._tag).toBe('None');
    });
  });

  describe('map', () => {
    it('passes through with the new type', () => {
      expect(none.map((_v: never) => 1).isNone()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('passes through', () => {
      expect(none.flatMap((_v: never) => some(1)).isNone()).toBe(true);
    });
  });

  describe('filter', () => {
    it('stays None', () => {
      expect(none.filter((_v: never) => true).isNone()).toBe(true);
    });
  });

  describe('filterMap', () => {
    it('passes through', () => {
      expect(none.filterMap((_v: never) => some(1)).isNone()).toBe(true);
    });
  });

  describe('tap', () => {
    it('does not invoke the function', () => {
      let called = false;
      none.tap(() => {
        called = true;
      });
      expect(called).toBe(false);
      expect(none.isNone()).toBe(true);
    });
  });

  describe('tapAsync', () => {
    it('returns a resolved None', async () => {
      const result = await none.tapAsync(async () => {
        /* never called */
      });
      expect(result.isNone()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to none()', () => {
      expect(
        none.match({
          some: () => 's',
          none: () => 'n',
        }),
      ).toBe('n');
    });
  });

  describe('fold', () => {
    it('dispatches to onNone', () => {
      expect(
        none.fold(
          () => 's',
          () => 'n',
        ),
      ).toBe('n');
    });
  });

  describe('getOrElse', () => {
    it('returns the default', () => {
      expect(none.getOrElse(42)).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('throws with default message when no message is supplied', () => {
      expect(() => none.getOrThrow()).toThrow('Expected Some but got None');
    });

    it('throws with the supplied message', () => {
      expect(() => none.getOrThrow('custom')).toThrow('custom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns null', () => {
      expect(none.getOrNull()).toBe(null);
    });

    it('returns undefined', () => {
      expect(none.getOrUndefined()).toBe(undefined);
    });
  });

  describe('get', () => {
    it('returns None for any key', () => {
      expect(none.get('a').isNone()).toBe(true);
    });
  });

  describe('toResult', () => {
    it('produces Err with the given error', () => {
      const r = none.toResult('err');
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('err');
    });
  });

  describe('toArray / toIterable', () => {
    it('returns an empty array', () => {
      expect(none.toArray()).toEqual([]);
    });

    it('returns an empty iterable', () => {
      const out: never[] = [];
      for (const x of none.toIterable()) out.push(x);
      expect(out).toEqual([]);
    });
  });

  describe('isSome / isNone', () => {
    it('isSome is false', () => {
      expect(none.isSome()).toBe(false);
    });

    it('isNone is true', () => {
      expect(none.isNone()).toBe(true);
    });
  });

  describe('maybe() factory', () => {
    it('returns None for null', () => {
      expect(maybe(null).isNone()).toBe(true);
    });

    it('returns None for undefined', () => {
      expect(maybe(undefined).isNone()).toBe(true);
    });

    it('returns Some for a value', () => {
      expect(maybe(0).isSome()).toBe(true);
    });
  });
});
