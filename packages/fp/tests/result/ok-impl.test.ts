import { describe, it, expect } from 'vitest';
import { ok, err, some, none } from '@deessejs/fp';

describe('OkImpl', () => {
  describe('factory', () => {
    it('carries the value and the _tag', () => {
      const r = ok(10);
      expect(r.value).toBe(10);
      expect(r._tag).toBe('Ok');
    });
  });

  describe('map', () => {
    it('applies the function', () => {
      expect(ok(10).map((x) => x * 2).getOrNull()).toBe(20);
    });
  });

  describe('flatMap', () => {
    it('binds to a Result', () => {
      expect(ok(10).flatMap((x) => ok<number, string>(x + 1)).getOrNull()).toBe(11);
    });

    it('binds to a Result.Err', () => {
      const out = ok(10).flatMap(() => err<number, string>('e'));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('returns this unchanged', () => {
      const src = ok<number, string>(10);
      const out = src.mapError((e: never) => 'other');
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(10);
    });
  });

  describe('filter', () => {
    it('returns Ok when predicate passes', () => {
      expect(ok(10).filter((x) => x > 5).isOk()).toBe(true);
    });

    it('returns Err(errorFn(value)) when predicate fails and errorFn supplied', () => {
      const out = ok<number, string>(3).filter((x) => x % 2 === 0, (x) => `odd:${x}`);
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('odd:3');
    });

    it('returns Ok when predicate fails and no errorFn supplied', () => {
      expect(ok<number, string>(3).filter((x) => x % 2 === 0).isOk()).toBe(true);
    });
  });

  describe('tap', () => {
    it('runs the side effect and returns the same Ok', () => {
      let seen = 0;
      const out = ok(10).tap((x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isOk()).toBe(true);
    });
  });

  describe('tapAsync', () => {
    it('awaits the side effect and returns the same Ok', async () => {
      let seen = 0;
      const out = await ok(10).tapAsync(async (x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isOk()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('binds to a Promise<Ok>', async () => {
      const out = await ok(10).flatMapAsync(async (x) => ok<number, string>(x + 1));
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(11);
    });

    it('binds to a Promise<Err>', async () => {
      const out = await ok(10).flatMapAsync(async () => err<number, string>('e'));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to ok()', () => {
      expect(
        ok(10).match({
          ok: (v) => v * 2,
          err: () => 0,
        }),
      ).toBe(20);
    });
  });

  describe('fold', () => {
    it('dispatches to onOk', () => {
      expect(
        ok(10).fold(
          (v) => v + 1,
          () => 0,
        ),
      ).toBe(11);
    });
  });

  describe('getOrElse', () => {
    it('returns the value', () => {
      expect(ok(10).getOrElse(42)).toBe(10);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value', () => {
      expect(ok(10).getOrThrow('msg')).toBe(10);
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value', () => {
      expect(ok(10).getOrNull()).toBe(10);
      expect(ok(10).getOrUndefined()).toBe(10);
    });
  });

  describe('toMaybe / toOption', () => {
    it('produces Some', () => {
      expect(ok(10).toMaybe().isSome()).toBe(true);
    });

    it('produces Some via toOption', () => {
      expect(ok(10).toOption().isSome()).toBe(true);
    });
  });

  describe('isOk / isErr', () => {
    it('isOk is true', () => {
      expect(ok(10).isOk()).toBe(true);
    });

    it('isErr is false', () => {
      expect(ok(10).isErr()).toBe(false);
    });
  });

  // cross-conversion sanity checks
  describe('cross-conversion smoke', () => {
    it('references err, some, none', () => {
      expect(err('e').isErr()).toBe(true);
      expect(some(1).isSome()).toBe(true);
      expect(none.isNone()).toBe(true);
    });
  });
});
