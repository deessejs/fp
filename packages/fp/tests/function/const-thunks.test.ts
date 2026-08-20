import { describe, it, expect } from 'vitest';
import { constTrue, constFalse, constNull, constUndefined, constVoid } from '@deessejs/fp';

describe('constTrue', () => {
  it('always returns true', () => {
    expect(constTrue()).toBe(true);
  });
});

describe('constFalse', () => {
  it('always returns false', () => {
    expect(constFalse()).toBe(false);
  });
});

describe('constNull', () => {
  it('always returns null', () => {
    expect(constNull()).toBe(null);
  });
});

describe('constUndefined', () => {
  it('always returns undefined', () => {
    expect(constUndefined()).toBe(undefined);
  });
});

describe('constVoid', () => {
  it('always returns undefined (void type)', () => {
    expect(constVoid()).toBe(undefined);
  });
});