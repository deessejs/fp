import { describe, it, expect } from 'vitest';
import { err, ok, some, none } from '@deessejs/fp';

describe('ErrImpl', () => {
  describe('factory', () => {
    it('carries the error and the _tag', () => {
      const e = err('boom');
      expect(e.error).toBe('boom');
      expect(e._tag).toBe('Err');
    });
  });

  describe('map', () => {
    it('passes through with the new value type', () => {
      const out = err<number, string>('e').map((x: number) => x * 2);
      expect(out.isErr()).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('passes through', () => {
      const out = err<number, string>('e').flatMap((x: number) => ok(x + 1));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('mapError', () => {
    it('applies the function', () => {
      const out = err<number, string>('e').mapError((e: string) => e.toUpperCase());
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('E');
    });
  });

  describe('filter', () => {
    it('passes through', () => {
      const out = err<number, string>('e').filter((x: number) => x > 0, (x: number) => 'odd');
      expect(out.isErr()).toBe(true);
      if (out.isErr()) expect(out.error).toBe('e');
    });
  });

  describe('tap', () => {
    it('does not invoke the function', () => {
      let called = false;
      err<number, string>('e').tap(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('tapAsync', () => {
    it('returns a resolved Err', async () => {
      const out = await err<number, string>('e').tapAsync(async () => {
        /* never */
      });
      expect(out.isErr()).toBe(true);
    });
  });

  describe('flatMapAsync', () => {
    it('passes through', async () => {
      const out = await err<number, string>('e').flatMapAsync(async (x: number) => ok(x + 1));
      expect(out.isErr()).toBe(true);
    });
  });

  describe('match', () => {
    it('dispatches to err()', () => {
      expect(
        err<string, number>(42).match({
          ok: (v) => `ok:${v}`,
          err: (e) => `err:${e}`,
        }),
      ).toBe('err:42');
    });
  });

  describe('fold', () => {
    it('dispatches to onErr', () => {
      expect(
        err<string, number>(42).fold(
          (v: string) => v,
          (e: number) => `err:${e}`,
        ),
      ).toBe('err:42');
    });
  });

  describe('getOrElse', () => {
    it('returns the default', () => {
      expect(err<number, string>('e').getOrElse(42)).toBe(42);
    });
  });

  describe('getOrThrow', () => {
    it('throws with default message when no message is supplied', () => {
      expect(() => err('boom').getOrThrow()).toThrow('boom');
    });

    it('throws with the supplied message', () => {
      expect(() => err('boom').getOrThrow('custom')).toThrow('custom');
    });
  });

  describe('getOrNull / getOrUndefined', () => {
    it('returns null', () => {
      expect(err<number, string>('e').getOrNull()).toBe(null);
    });

    it('returns undefined', () => {
      expect(err<number, string>('e').getOrUndefined()).toBe(undefined);
    });
  });

  describe('toMaybe / toOption', () => {
    it('produces None', () => {
      expect(err<number, string>('e').toMaybe().isNone()).toBe(true);
    });

    it('produces None via toOption', () => {
      expect(err<number, string>('e').toOption().isNone()).toBe(true);
    });
  });

  describe('isOk / isErr', () => {
    it('isOk is false', () => {
      expect(err('e').isOk()).toBe(false);
    });

    it('isErr is true', () => {
      expect(err('e').isErr()).toBe(true);
    });
  });

  // cross-conversion sanity checks
  describe('cross-conversion smoke', () => {
    it('references ok and some', () => {
      expect(ok(1).isOk()).toBe(true);
      expect(some(1).isSome()).toBe(true);
      expect(none.isNone()).toBe(true);
    });
  });
});
