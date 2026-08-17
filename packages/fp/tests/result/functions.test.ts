import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  some,
  none,
  map as mapR,
  flatMap as flatMapR,
  mapError as mapErrorR,
  filter as filterR,
  tap as tapR,
  tapAsync as tapAsyncR,
  flatMapAsync as flatMapAsyncR,
  match as matchR,
  fold as foldR,
  getOrElse as getOrElseR,
  getOrThrow as getOrThrowR,
  getOrNull as getOrNullR,
  getOrUndefined as getOrUndefinedR,
  toMaybe as toMaybeR,
  toOption as toOptionR,
  isOk as isOkR,
  isErr as isErrR,
} from '@deessejs/fp';

describe('Result pipeables', () => {
  describe('map', () => {
    it('applies the function on Ok', () => {
      expect(mapR((x: number) => x * 2)(ok(10)).getOrNull()).toBe(20);
    });

    it('passes through on Err', () => {
      expect(mapR((x: number) => x * 2)(err<number, string>('e')).isErr()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('binds on Ok to Ok', () => {
      expect(flatMapR((x: number) => ok<number, string>(x + 1))(ok(10)).getOrNull()).toBe(11);
    });

    it('binds on Ok to Err', () => {
      expect(flatMapR(() => err<number, string>('e'))(ok(10)).isErr()).toBe(true);
    });

    it('passes through on Err', () => {
      expect(flatMapR(() => ok<number, string>(1))(err<number, string>('e')).isErr()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('applies the function on Err', () => {
      const out = mapErrorR((e: string) => e.toUpperCase())(err('e'));
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('E');
    });

    it('passes through on Ok', () => {
      expect(mapErrorR((e: string) => e.toUpperCase())(ok(10)).isOk()).toBe(true);
    });
  });

  describe('filter', () => {
    it('keeps Ok when predicate passes', () => {
      expect(filterR((x: number) => x > 5)(ok(10)).isOk()).toBe(true);
    });

    it('returns Err(errorFn) when predicate fails and errorFn supplied', () => {
      const out = filterR((x: number) => x % 2 === 0, (x) => `odd:${x}`)(ok(3));
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('odd:3');
    });

    it('passes Ok through when predicate fails and no errorFn', () => {
      expect(filterR((x: number) => x % 2 === 0)(ok(3)).isOk()).toBe(true);
    });

    it('passes through on Err', () => {
      expect(filterR((x: number) => true)(err<number, string>('e')).isErr()).toBe(true);
    });
  });

  describe('tap', () => {
    it('runs the side effect on Ok', () => {
      let seen = 0;
      tapR((x: number) => {
        seen = x;
      })(ok(10));
      expect(seen).toBe(10);
    });

    it('does not run on Err', () => {
      let called = false;
      tapR(() => {
        called = true;
      })(err<number, string>('e'));
      expect(called).toBe(false);
    });
  });

  describe('tapAsync', () => {
    it('awaits on Ok', async () => {
      let seen = 0;
      const out = await tapAsyncR(async (x: number) => {
        seen = x;
      })(ok(10));
      expect(seen).toBe(10);
      expect(out.isOk()).toBe(true);
    });

    it('passes through on Err', async () => {
      const out = await tapAsyncR(async () => {
        /* never */
      })(err<number, string>('e'));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('binds on Ok to Promise<Ok>', async () => {
      const out = await flatMapAsyncR(async (x: number) => ok<number, string>(x + 1))(ok(10));
      expect(out.isOk()).toBe(true);
      if (out.isOk()) expect(out.value).toBe(11);
    });

    it('binds on Ok to Promise<Err>', async () => {
      const out = await flatMapAsyncR(async () => err<number, string>('e'))(ok(10));
      expect(out.isErr()).toBe(true);
    });

    it('passes through on Err', async () => {
      const out = await flatMapAsyncR(async () => ok<number, string>(1))(err<number, string>('e'));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to ok on Ok', () => {
      expect(
        matchR<number, string, string>({
          ok: (v) => `ok:${v}`,
          err: () => 'err',
        })(ok(10)),
      ).toBe('ok:10');
    });

    it('dispatches to err on Err', () => {
      expect(
        matchR<number, string, string>({
          ok: () => 'ok',
          err: (e) => `err:${e}`,
        })(err('e')),
      ).toBe('err:e');
    });
  });

  describe('fold', () => {
    it('dispatches to onOk', () => {
      expect(
        foldR(
          (v: number) => v + 1,
          () => 0,
        )(ok(10)),
      ).toBe(11);
    });

    it('dispatches to onErr', () => {
      expect(
        foldR(
          (v: number) => v + 1,
          (e: string) => e.length,
        )(err('hello')),
      ).toBe(5);
    });
  });

  describe('getOrElse', () => {
    it('returns the value on Ok', () => {
      expect(getOrElseR(42)(ok(10))).toBe(10);
    });

    it('returns the default on Err', () => {
      expect(getOrElseR(42)(err<number, string>('e'))).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value on Ok', () => {
      expect(getOrThrowR('msg')(ok(10))).toBe(10);
    });

    it('throws on Err', () => {
      expect(() => getOrThrowR('custom')(err('boom'))).toThrow('custom');
    });

    it('throws default on Err', () => {
      expect(() => getOrThrowR()(err('boom'))).toThrow('boom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value on Ok', () => {
      expect(getOrNullR()(ok(10))).toBe(10);
      expect(getOrUndefinedR()(ok(10))).toBe(10);
    });

    it('returns null/undefined on Err', () => {
      expect(getOrNullR()(err<number, string>('e'))).toBe(null);
      expect(getOrUndefinedR()(err<number, string>('e'))).toBe(undefined);
    });
  });

  describe('toMaybe / toOption', () => {
    it('produces Some on Ok', () => {
      expect(toMaybeR()(ok(10)).isSome()).toBe(true);
      expect(toOptionR()(ok(10)).isSome()).toBe(true);
    });

    it('produces None on Err', () => {
      expect(toMaybeR()(err<number, string>('e')).isNone()).toBe(true);
      expect(toOptionR()(err<number, string>('e')).isNone()).toBe(true);
    });
  });

  describe('isOk / isErr', () => {
    it('isOk narrows Ok', () => {
      const r = ok(10);
      if (isOkR(r)) {
        expect(r.value).toBe(10);
      } else {
        throw new Error('expected Ok');
      }
    });

    it('isErr narrows Err', () => {
      const r = err<string, number>(42);
      if (isErrR(r)) {
        expect(r.error).toBe(42);
      } else {
        throw new Error('expected Err');
      }
    });
  });

  // smoke: other primitives used here are exercised transitively
  it('imports some and none', () => {
    expect(some(1).isSome()).toBe(true);
    expect(none.isNone()).toBe(true);
  });
});
