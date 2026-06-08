/**
 * Dual API Demo - Instance Methods vs Method Chaining
 *
 * Demonstrates: Both styles produce the same result.
 * Choose based on preference or team conventions.
 */

import { ok } from '../src';

// Instance methods - familiar to OOP developers
const instanceStyle = ok(10)
  .map((x) => x * 2)
  .filter((x) => x > 5)
  .getOrElse(0);

// Manual chaining - shows the transformation step by step
const step1 = ok(10);
const step2 = step1.map((x) => x * 2);
const step3 = step2.filter((x) => x > 5);
const step4 = step3.getOrElse(0);

console.log('Instance style:', instanceStyle); // 20
console.log('Step by step:', step4); // 20
console.log('Same result:', instanceStyle === step4); // true

// For pipe() function support, see pipe.ts example (coming soon)
// import { pipe } from '../src';
// const pipeStyle = pipe(ok(10), map(x => x * 2), filter(x => x > 5), getOrElse(0));