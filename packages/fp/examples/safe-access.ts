/**
 * Safe Property Access with Maybe
 *
 * Demonstrates: some/none/maybe, map, getOrElse, optional chaining
 */

import { some, none, maybe, Maybe } from '../src';

interface Address {
  city?: string;
  zip?: string;
}

interface User {
  name: string;
  address?: Address;
}

// Safe access through optional chain
function getCity(user: User | null): Maybe<string> {
  return maybe(user?.address?.city);
}

// Usage
const userWithCity: User = { name: 'Alice', address: { city: 'Paris' } };
const userWithoutCity: User = { name: 'Bob' };
const noUser: User | null = null;

console.log(getCity(userWithCity).getOrElse('Unknown')); // Paris
console.log(getCity(userWithoutCity).getOrElse('Unknown')); // Unknown
console.log(getCity(noUser).getOrElse('Unknown')); // Unknown