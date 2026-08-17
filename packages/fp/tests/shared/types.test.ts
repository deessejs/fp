import { describe, it, expect } from 'vitest';
import { isResult, isMaybe, isUnit, ok, err, some, none, unit } from '@deessejs/fp';

describe('isResult', () => {
  it('returns true for Ok', () => {
    expect(isResult(ok(1))).toBe(true);
  });

  it('returns true for Err', () => {
    expect(isResult(err('e'))).toBe(true);
  });

  it('returns false for null', () => {
    expect(isResult(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isResult(undefined)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isResult(1)).toBe(false);
    expect(isResult('s')).toBe(false);
    expect(isResult(true)).toBe(false);
  });

  it('returns false for plain objects without _tag', () => {
    expect(isResult({})).toBe(false);
    expect(isResult({ value: 1 })).toBe(false);
  });

  it('returns false for objects with an unknown _tag', () => {
    expect(isResult({ _tag: 'Maybe' })).toBe(false);
  });
});

describe('isMaybe', () => {
  it('returns true for Some', () => {
    expect(isMaybe(some(1))).toBe(true);
  });

  it('returns true for None', () => {
    expect(isMaybe(none)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isMaybe(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isMaybe(undefined)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isMaybe(1)).toBe(false);
    expect(isMaybe('s')).toBe(false);
    expect(isMaybe(true)).toBe(false);
  });

  it('returns false for plain objects without _tag', () => {
    expect(isMaybe({})).toBe(false);
    expect(isMaybe({ value: 1 })).toBe(false);
  });

  it('returns false for objects with an unknown _tag', () => {
    expect(isMaybe({ _tag: 'Result' })).toBe(false);
  });
});

describe('isUnit', () => {
  it('returns true for unit', () => {
    expect(isUnit(unit)).toBe(true);
  });

  it('returns false for null and undefined', () => {
    expect(isUnit(null)).toBe(false);
    expect(isUnit(undefined)).toBe(false);
  });

  it('returns false for primitives and plain objects', () => {
    expect(isUnit('s')).toBe(false);
    expect(isUnit(1)).toBe(false);
    expect(isUnit({})).toBe(false);
    expect(isUnit({ _tag: 'Other' })).toBe(false);
  });
});
