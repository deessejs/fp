import { describe, it, expect } from 'vitest';
import {
  success,
  failure,
  ok,
  err,
  mapTry,
  flatMapTry,
  mapErrorTry,
  tapTry,
  tapAsyncTry,
  flatMapAsyncTry,
  matchTry,
  foldTry,
  getOrElseTry,
  getOrThrowTry,
  getOrNullTry,
  getOrUndefinedTry,
  toResultTry,
  isSuccess,
  isFailure,
} from '@deessejs/fp';

describe('Try pipeables', () => {
  describe('map', () => {
    it('applies the function on Success', () => {
      expect(mapTry((x: number) => x * 2)(success(10)).getOrNull()).toBe(20);
    });

    it('passes through on Failure', () => {
      expect(mapTry((x: number) => x * 2)(failure<number, string>('e')).isFailure()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('binds on Success to Success', () => {
      expect(flatMapTry((x: number) => success<number, string>(x + 1))(success(10)).getOrNull()).toBe(11);
    });

    it('binds on Success to Failure', () => {
      expect(flatMapTry(() => failure<number, string>('e'))(success(10)).isFailure()).toBe(true);
    });

    it('passes through on Failure', () => {
      expect(flatMapTry(() => success<number, string>(1))(failure<number, string>('e')).isFailure()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('applies the function on Failure', () => {
      const out = mapErrorTry((e: string) => e.toUpperCase())(failure('e'));
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('E');
    });

    it('passes through on Success', () => {
      expect(mapErrorTry((e: string) => e.toUpperCase())(success(10)).isSuccess()).toBe(true);
    });
  });

  describe('tap', () => {
    it('runs the side effect on Success', () => {
      let seen = 0;
      tapTry((x: number) => {
        seen = x;
      })(success(10));
      expect(seen).toBe(10);
    });

    it('does not run on Failure', () => {
      let called = false;
      tapTry(() => {
        called = true;
      })(failure<number, string>('e'));
      expect(called).toBe(false);
    });
  });

  describe('tapAsync', () => {
    it('awaits on Success', async () => {
      let seen = 0;
      const out = await tapAsyncTry(async (x: number) => {
        seen = x;
      })(success(10));
      expect(seen).toBe(10);
      expect(out.isSuccess()).toBe(true);
    });

    it('passes through on Failure', async () => {
      const out = await tapAsyncTry(async () => {
        /* never */
      })(failure<number, string>('e'));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('binds on Success to Promise<Success>', async () => {
      const out = await flatMapAsyncTry(async (x: number) => success<number, string>(x + 1))(success(10));
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(11);
    });

    it('binds on Success to Promise<Failure>', async () => {
      const out = await flatMapAsyncTry(async () => failure<number, string>('e'))(success(10));
      expect(out.isFailure()).toBe(true);
    });

    it('passes through on Failure', async () => {
      const out = await flatMapAsyncTry(async () => success<number, string>(1))(failure<number, string>('e'));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to success on Success', () => {
      expect(
        matchTry<number, string, string>({
          success: (v) => `ok:${v}`,
          failure: () => 'err',
        })(success(10)),
      ).toBe('ok:10');
    });

    it('dispatches to failure on Failure', () => {
      expect(
        matchTry<number, string, string>({
          success: () => 'ok',
          failure: (e) => `err:${e}`,
        })(failure('e')),
      ).toBe('err:e');
    });
  });

  describe('fold', () => {
    it('dispatches to onSuccess', () => {
      expect(
        foldTry(
          (v: number) => v + 1,
          () => 0,
        )(success(10)),
      ).toBe(11);
    });

    it('dispatches to onFailure', () => {
      expect(
        foldTry(
          (v: number) => v + 1,
          (e: string) => e.length,
        )(failure('hello')),
      ).toBe(5);
    });
  });

  describe('getOrElse', () => {
    it('returns the value on Success', () => {
      expect(getOrElseTry(42)(success(10))).toBe(10);
    });

    it('returns the default on Failure', () => {
      expect(getOrElseTry(42)(failure<number, string>('e'))).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value on Success', () => {
      expect(getOrThrowTry('msg')(success(10))).toBe(10);
    });

    it('throws on Failure', () => {
      expect(() => getOrThrowTry('custom')(failure('boom'))).toThrow('custom');
    });

    it('throws default on Failure', () => {
      expect(() => getOrThrowTry()(failure('boom'))).toThrow('boom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value on Success', () => {
      expect(getOrNullTry()(success(10))).toBe(10);
      expect(getOrUndefinedTry()(success(10))).toBe(10);
    });

    it('returns null/undefined on Failure', () => {
      expect(getOrNullTry()(failure<number, string>('e'))).toBe(null);
      expect(getOrUndefinedTry()(failure<number, string>('e'))).toBe(undefined);
    });
  });

  describe('toResult', () => {
    it('produces Ok on Success', () => {
      expect(toResultTry()(success(10)).isOk()).toBe(true);
    });

    it('produces Err on Failure', () => {
      expect(toResultTry()(failure<number, string>('e')).isErr()).toBe(true);
    });
  });

  describe('isSuccess / isFailure', () => {
    it('isSuccess narrows Success', () => {
      const t = success(10);
      if (isSuccess(t)) {
        expect(t.value).toBe(10);
      } else {
        throw new Error('expected Success');
      }
    });

    it('isFailure narrows Failure', () => {
      const t = failure<string, number>(42);
      if (isFailure(t)) {
        expect(t.cause).toBe(42);
      } else {
        throw new Error('expected Failure');
      }
    });
  });

  // smoke
  it('imports ok and err', () => {
    expect(ok(1).isOk()).toBe(true);
    expect(err('e').isErr()).toBe(true);
  });
});
