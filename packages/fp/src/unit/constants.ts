/**
 * Unit constants and utilities
 */

import type { Unit } from './types.js';

/**
 * The Unit singleton value
 */
export const unit: Unit = { _tag: 'Unit' } as const;

/**
 * Check if a value is Unit
 */
export function isUnit(value: unknown): value is Unit {
  return (value as Unit)?._tag === 'Unit';
}