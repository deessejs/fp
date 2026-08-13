/**
 * Unit constants and utilities
 */

import type { Unit } from './types.js';

/**
 * The Unit singleton value.
 */
export const unit: Unit = { _tag: 'Unit' } as const;

/**
 * Check if a value is Unit.
 *
 * The guard is explicit, not optional-chained, because rule 0004
 * forbids defending against values that cannot be null after the
 * type system has narrowed them.
 */
export function isUnit(value: unknown): value is Unit {
  return typeof value === 'object' && value !== null && '_tag' in value && value._tag === 'Unit';
}