import { describe, it, expect } from 'vitest';
import { ok, err, some, none, maybe, unit, isUnit } from '../src/index';

describe('Result', () => {
  describe('ok', () => {
    it('should create an Ok result', () => {
      const result = ok(10);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.getOrNull()).toBe(10);
    });

    it('should map over Ok value', () => {
      const result = ok(10).map((x) => x * 2);
      expect(result.getOrNull()).toBe(20);
    });

    it('should match ok case', () => {
      const result = ok(10).match({
        ok: (v) => v * 2,
        err: () => 0,
      });
      expect(result).toBe(20);
    });
  });

  describe('err', () => {
    it('should create an Err result', () => {
      const result = err('error');
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.getOrNull()).toBe(null);
    });

    it('should return null for getOrNull', () => {
      const result = err('error');
      expect(result.getOrNull()).toBe(null);
    });

    it('should match err case', () => {
      const result = err('error').match({
        ok: (v) => v,
        err: (e) => `error: ${e}`,
      });
      expect(result).toBe('error: error');
    });
  });
});

describe('Maybe', () => {
  describe('some', () => {
    it('should create a Some', () => {
      const result = some(10);
      expect(result.isSome()).toBe(true);
      expect(result.isNone()).toBe(false);
      expect(result.getOrNull()).toBe(10);
    });

    it('should map over Some value', () => {
      const result = some(10).map((x) => x * 2);
      expect(result.getOrNull()).toBe(20);
    });

    it('should match some case', () => {
      const result = some(10).match({
        some: (v) => v * 2,
        none: () => 0,
      });
      expect(result).toBe(20);
    });
  });

  describe('none', () => {
    it('should create a None', () => {
      const result = none;
      expect(result.isSome()).toBe(false);
      expect(result.isNone()).toBe(true);
    });

    it('should return default value for getOrElse', () => {
      expect(none.getOrElse(42)).toBe(42);
    });

    it('should match none case', () => {
      const result = none.match({
        some: (v) => v,
        none: () => 0,
      });
      expect(result).toBe(0);
    });
  });

  describe('maybe', () => {
    it('should return Some for non-null value', () => {
      const result = maybe(10);
      expect(result.isSome()).toBe(true);
    });

    it('should return None for null', () => {
      const result = maybe(null);
      expect(result.isNone()).toBe(true);
    });

    it('should return None for undefined', () => {
      const result = maybe(undefined);
      expect(result.isNone()).toBe(true);
    });
  });
});

describe('Unit', () => {
  it('should have correct structure', () => {
    expect(isUnit(unit)).toBe(true);
    expect(isUnit(null)).toBe(false);
    expect(isUnit(undefined)).toBe(false);
    expect(isUnit('not a unit')).toBe(false);
  });
});