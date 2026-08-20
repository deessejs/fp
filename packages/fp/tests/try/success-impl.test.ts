import { describe, it, expect } from 'vitest';
import { success, failure, try_, ok, err } from '@deessejs/fp';

describe('SuccessImpl', () => {
  describe('factory', () => {
    it('carries the value and the _tag', () => {
      const r = success(10);
      expect(r.value).toBe(10);
      expect(r._tag).toBe('Success');
    });
  });

  describe('map', () => {
    it('applies the function', () => {
      expect(success(10).map((x) => x * 2).getOrNull()).toBe(20);
    });
  });

  describe('flatMap', () => {
    it('binds to a Success', () => {
      expect(success(10).flatMap((x) => success<number, string>(x + 1)).getOrNull()).toBe(11);
    });

    it('binds to a Failure', () => {
      const out = success(10).flatMap(() => failure<number, string>('e'));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('returns this unchanged', () => {
      const src = success<number, string>(10);
      const out = src.mapError((e: never) => 'other');
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(10);
    });
  });

  describe('tap', () => {
    it('runs the side effect and returns the same Success', () => {
      let seen = 0;
      const out = success(10).tap((x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isSuccess()).toBe(true);
    });
  });

  describe('tapAsync', () => {
    it('awaits the side effect and returns the same Success', async () => {
      let seen = 0;
      const out = await success(10).tapAsync(async (x) => {
        seen = x;
      });
      expect(seen).toBe(10);
      expect(out.isSuccess()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('binds to a Promise<Success>', async () => {
      const out = await success(10).flatMapAsync(async (x) => success<number, string>(x + 1));
      expect(out.isSuccess()).toBe(true);
      if (out.isSuccess()) expect(out.value).toBe(11);
    });

    it('binds to a Promise<Failure>', async () => {
      const out = await success(10).flatMapAsync(async () => failure<number, string>('e'));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to success()', () => {
      expect(
        success(10).match({
          success: (v) => v * 2,
          failure: () => 0,
        }),
      ).toBe(20);
    });
  });

  describe('fold', () => {
    it('dispatches to onSuccess', () => {
      expect(
        success(10).fold(
          (v) => v + 1,
          () => 0,
        ),
      ).toBe(11);
    });
  });

  describe('getOrElse', () => {
    it('returns the value', () => {
      expect(success(10).getOrElse(42)).toBe(10);
    });
  });

  describe('getOrThrow', () => {
    it('returns the value', () => {
      expect(success(10).getOrThrow('msg')).toBe(10);
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns the value', () => {
      expect(success(10).getOrNull()).toBe(10);
      expect(success(10).getOrUndefined()).toBe(10);
    });
  });

  describe('toResult', () => {
    it('produces Ok', () => {
      expect(success(10).toResult().isOk()).toBe(true);
      if (success(10).toResult().isOk()) {
        // narrowed
      }
    });
  });

  describe('isSuccess / isFailure', () => {
    it('isSuccess is true', () => {
      expect(success(10).isSuccess()).toBe(true);
    });

    it('isFailure is false', () => {
      expect(success(10).isFailure()).toBe(false);
    });
  });

  // cross-conversion smoke
  describe('cross-conversion smoke', () => {
    it('references failure, ok, err, try_', () => {
      expect(failure('e').isFailure()).toBe(true);
      expect(ok(1).isOk()).toBe(true);
      expect(err('e').isErr()).toBe(true);
      expect(try_<number>(() => 42).isSuccess()).toBe(true);
    });
  });
});
