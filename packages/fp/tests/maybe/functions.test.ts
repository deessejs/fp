import { describe, it, expect } from 'vitest';
import {
  some,
  none,
  ok,
  err,
  mapMaybe,
  flatMapMaybe,
  filterMaybe,
  filterMap,
  tapMaybe,
  tapAsyncMaybe,
  matchMaybe,
  foldMaybe,
  getOrElseMaybe,
  getOrThrowMaybe,
  getOrNullMaybe,
  getOrUndefinedMaybe,
  getMaybe,
  toResult,
  toArray,
  toIterable,
  isSome,
  isNone,
} from '@deessejs/fp';

describe('Maybe pipeables', () => {
  describe('map', () => {
    it('applies the function on Some', () => {
      expect(mapMaybe((x: number) => x * 2)(some(10)).getOrNull()).toBe(20);
    });

    it('passes through on None', () => {
      expect(mapMaybe((x: number) => x * 2)(none).isNone()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('binds on Some', () => {
      expect(flatMapMaybe((x: number) => some(x + 1))(some(10)).getOrNull()).toBe(11);
    });

    it('passes through on None', () => {
      expect(flatMapMaybe(() => none)(none).isNone()).toBe(true);
    });
  });

  describe('filter', () => {
    it('keeps Some when predicate passes', () => {
      expect(filterMaybe((x: number) => x > 5)(some(10)).isSome()).toBe(true);
    });

    it('drops Some when predicate fails', () => {
      expect(filterMaybe((x: number) => x > 100)(some(10)).isNone()).toBe(true);
    });

    it('passes through on None', () => {
      expect(filterMaybe(() => true)(none).isNone()).toBe(true);
    });
  });

  describe('filterMap', () => {
    it('keeps Some', () => {
      expect(filterMap((x: number) => some(x + 1))(some(10)).getOrNull()).toBe(11);
    });

    it('transitions to None', () => {
      expect(filterMap(() => none)(some(10)).isNone()).toBe(true);
    });

    it('passes through on None', () => {
      expect(filterMap(() => some(1))(none).isNone()).toBe(true);
    });
  });

  describe('tap', () => {
    it('runs the side effect on Some', () => {
      let seen = 0;
      tapMaybe((x: number) => {
        seen = x;
      })(some(10));
      expect(seen).toBe(10);
    });

    it('does not run on None', () => {
      let called = false;
      tapMaybe(() => {
        called = true;
      })(none);
      expect(called).toBe(false);
    });
  });

  describe('tapAsync', () => {
    it('awaits the side effect on Some', async () => {
      let seen = 0;
      const out = await tapAsyncMaybe(async (x: number) => {
        seen = x;
      })(some(10));
      expect(seen).toBe(10);
      expect(out.isSome()).toBe(true);
    });

    it('passes through on None', async () => {
      const out = await tapAsyncMaybe(async () => {
        /* never */
      })(none);
      expect(out.isNone()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to some on Some', () => {
      expect(
        matchMaybe<number, string>({
          some: (v) => `s:${v}`,
          none: () => 'n',
        })(some(10)),
      ).toBe('s:10');
    });

    it('dispatches to none on None', () => {
      expect(
        matchMaybe<number, string>({
          some: () => 's',
          none: () => 'n',
        })(none),
      ).toBe('n');
    });
  });

  describe('fold', () => {
    it('dispatches to onSome', () => {
      expect(
        foldMaybe(
          (v: number) => v + 1,
          () => 0,
        )(some(10)),
      ).toBe(11);
    });

    it('dispatches to onNone', () => {
      expect(
        foldMaybe(
          (v: number) => v + 1,
          () => 0,
        )(none),
      ).toBe(0);
    });
  });

  describe('getOrElse', () => {
    it('returns the value on Some', () => {
      expect(getOrElseMaybe(42)(some(10))).toBe(10);
    });

    it('returns the default on None', () => {
      expect(getOrElseMaybe(42)(none)).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value on Some', () => {
      expect(getOrThrowMaybe('msg')(some(10))).toBe(10);
    });

    it('throws on None without message', () => {
      expect(() => getOrThrowMaybe()(none)).toThrow('Expected Some but got None');
    });

    it('throws on None with message', () => {
      expect(() => getOrThrowMaybe('custom')(none)).toThrow('custom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value on Some', () => {
      expect(getOrNullMaybe()(some(10))).toBe(10);
      expect(getOrUndefinedMaybe()(some(10))).toBe(10);
    });

    it('returns null/undefined on None', () => {
      expect(getOrNullMaybe()(none)).toBe(null);
      expect(getOrUndefinedMaybe()(none)).toBe(undefined);
    });
  });

  describe('get', () => {
    it('projects a key on Some', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(getMaybe('name')(some(obj)).getOrNull()).toBe('Alice');
    });

    it('returns None on Some with missing key', () => {
      const obj: { name?: string } = {};
      expect(getMaybe('name')(some(obj)).isNone()).toBe(true);
    });

    it('returns None on None', () => {
      expect(getMaybe('name')(none).isNone()).toBe(true);
    });
  });

  describe('toResult', () => {
    it('produces Ok on Some', () => {
      expect(toResult('e')(some(10)).isOk()).toBe(true);
    });

    it('produces Err on None', () => {
      const r = toResult('e')(none);
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error).toBe('e');
    });
  });

  describe('toArray / toIterable', () => {
    it('produces a single-element array on Some', () => {
      expect(toArray()(some(10))).toEqual([10]);
    });

    it('produces an empty array on None', () => {
      expect(toArray()(none)).toEqual([]);
    });

    it('produces an iterable on Some', () => {
      const out: number[] = [];
      for (const x of toIterable()(some(10))) out.push(x);
      expect(out).toEqual([10]);
    });

    it('produces an empty iterable on None', () => {
      const out: never[] = [];
      for (const x of toIterable()(none)) out.push(x);
      expect(out).toEqual([]);
    });
  });

  describe('isSome / isNone', () => {
    it('isSome narrows Some', () => {
      const m = some(10);
      if (isSome(m)) {
        expect(m.value).toBe(10);
      } else {
        throw new Error('expected Some');
      }
    });

    it('isNone narrows None', () => {
      const m = none;
      if (isNone(m)) {
        expect(m._tag).toBe('None');
      } else {
        throw new Error('expected None');
      }
    });
  });

  // smoke: other primitives used here are exercised transitively
  it('imports ok and err', () => {
    expect(ok(1).isOk()).toBe(true);
    expect(err('e').isErr()).toBe(true);
  });
});
