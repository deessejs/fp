import { describe, it, expect } from 'vitest';
import { success, failure, try_, ok, err } from '@deessejs/fp';

describe('FailureImpl', () => {
  describe('factory', () => {
    it('carries the cause and the _tag', () => {
      const e = failure('boom');
      expect(e.cause).toBe('boom');
      expect(e._tag).toBe('Failure');
    });
  });

  describe('map', () => {
    it('passes through with the new value type', () => {
      const out = failure<number, string>('e').map((x: number) => x * 2);
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('passes through', () => {
      const out = failure<number, string>('e').flatMap((x: number) => success(x + 1));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('applies the function', () => {
      const out = failure<number, string>('e').mapError((e: string) => e.toUpperCase());
      expect(out.isFailure()).toBe(true);
      if (out.isFailure()) expect(out.cause).toBe('E');
    });
  });

  describe('tap', () => {
    it('does not invoke the function', () => {
      let called = false;
      failure<number, string>('e').tap(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('tapAsync', () => {
    it('returns a resolved Failure', async () => {
      const out = await failure<number, string>('e').tapAsync(async () => {
        /* never */
      });
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('passes through', async () => {
      const out = await failure<number, string>('e').flatMapAsync(async (x: number) => success(x + 1));
      expect(out.isFailure()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to failure()', () => {
      expect(
        failure<string, number>(42).match({
          success: (v) => `ok:${v}`,
          failure: (e) => `err:${e}`,
        }),
      ).toBe('err:42');
    });
  });

  describe('fold', () => {
    it('dispatches to onFailure', () => {
      expect(
        failure<string, number>(42).fold(
          (v: string) => v,
          (e: number) => `err:${e}`,
        ),
      ).toBe('err:42');
    });
  });

  describe('getOrElse', () => {
    it('returns the default', () => {
      expect(failure<number, string>('e').getOrElse(42)).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('throws with default message when no message is supplied', () => {
      expect(() => failure('boom').getOrThrow()).toThrow('boom');
    });

    it('throws with the supplied message', () => {
      expect(() => failure('boom').getOrThrow('custom')).toThrow('custom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns null', () => {
      expect(failure<number, string>('e').getOrNull()).toBe(null);
    });

    it('returns undefined', () => {
      expect(failure<number, string>('e').getOrUndefined()).toBe(undefined);
    });
  });

  describe('toResult', () => {
    it('produces Err', () => {
      expect(failure('e').toResult().isErr()).toBe(true);
    });
  });

  describe('isSuccess / isFailure', () => {
    it('isSuccess is false', () => {
      expect(failure('e').isSuccess()).toBe(false);
    });

    it('isFailure is true', () => {
      expect(failure('e').isFailure()).toBe(true);
    });
  });

  // cross-conversion smoke
  describe('cross-conversion smoke', () => {
    it('references success, ok, err, try_', () => {
      expect(success(1).isSuccess()).toBe(true);
      expect(ok(1).isOk()).toBe(true);
      expect(err('e').isErr()).toBe(true);
      expect(try_<number>(() => {
        throw new Error('x');
      }).isFailure()).toBe(true);
    });
  });
});
