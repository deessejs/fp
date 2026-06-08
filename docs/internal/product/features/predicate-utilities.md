# Predicate Utilities

Type-safe predicates and logical combinators.

## Installation

```typescript
import { Predicate, Refinement, not, and, or } from '@deessejs/fp';
```

## Real-World Examples

### Form Validation

```typescript
import { Predicate, not, and, or } from '@deessejs/fp';

// Basic predicates
const isNonEmpty: Predicate<string> = s => s.length > 0;
const isEmail: Predicate<string> = s => s.includes('@') && s.includes('.');
const minLength = (min: number): Predicate<string> => s => s.length >= min;
const maxLength = (max: number): Predicate<string> => s => s.length <= max;
const matches = (regex: RegExp): Predicate<string> => s => regex.test(s);

// Combine validators
const isValidPassword: Predicate<string> = and(
  minLength(8),
  maxLength(128),
  matches(/[A-Z]/),
  matches(/[a-z]/),
  matches(/[0-9]/),
);

// Form field validator
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateField(
  value: string,
  ...predicates: Array<Predicate<string>>
): ValidationResult {
  const errors = predicates
    .filter(p => !p(value))
    .map(p => getErrorMessage(p));

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Usage
const passwordResult = validateField(
  'weak',
  isNonEmpty,
  isValidPassword,
);
// { valid: false, errors: ['Must be at least 8 characters', 'Must contain uppercase'] }
```

### User Permissions

```typescript
import { Predicate, Refinement, not, and, or } from '@deessejs/fp';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
}

// User predicates
const isAdmin: Predicate<User> = u => u.role === 'admin';
const isModerator: Predicate<User> = u => u.role === 'moderator';
const isActive: Predicate<User> = u => u.isActive;
const hasEmailVerified: Predicate<User> = u => u.emailVerified;
const hasPermission = (perm: string): Predicate<User> => u => u.permissions.includes(perm);

// Staff user (admin or moderator)
const isStaff: Predicate<User> = or(isAdmin, isModerator);

// Can manage content (staff + verified email)
const canManageContent: Predicate<User> = and(
  isStaff,
  hasEmailVerified,
);

// Can delete (admin only)
const canDelete: Predicate<User> = and(
  isAdmin,
  isActive,
);

// Access control middleware
function requirePermission(permission: string) {
  return (user: User): boolean => and(
    isActive,
    hasPermission(permission),
  )(user);
}

const canAccessDashboard = requirePermission('dashboard:read');

// Guard usage
if (!canManageContent(currentUser)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Type Guard Refinements

```typescript
import { Refinement, not } from '@deessejs/fp';

// Basic refinements
const isString: Refinement<unknown, string> =
  (v): v is string => typeof v === 'string';

const isNumber: Refinement<unknown, number> =
  (v): v is number => typeof v === 'number';

const isObject: Refinement<unknown, object> =
  (v): v is object => typeof v === 'object' && v !== null;

const isArray: Refinement<unknown, unknown[]> =
  (v): v is unknown[] => Array.isArray(v);

// Refinement combinators
const isNonEmpty = <T>(refinement: Refinement<unknown, T>): Refinement<unknown, T> =>
  (v): v is T => refinement(v) && Array.isArray(v) ? v.length > 0 : refinement(v);

// API response refinements
const isUser = (v: unknown): v is { id: string; name: string; email: string } =>
  isObject(v) &&
  'id' in v && typeof (v as any).id === 'string' &&
  'name' in v && typeof (v as any).name === 'string' &&
  'email' in v && typeof (v as any).email === 'string';

const isErrorResponse = (v: unknown): v is { error: string; code?: number } =>
  isObject(v) && 'error' in v && typeof (v as any).error === 'string';

// Safe JSON parse with type narrowing
function safeParseJson(json: string): { data: unknown } | null {
  try {
    const parsed = JSON.parse(json);

    if (isUser(parsed)) {
      return { data: parsed }; // TypeScript knows parsed is User
    }

    return { data: parsed };
  } catch {
    return null;
  }
}

// Type-safe event handler
function handleEvent(event: unknown) {
  if (!isObject(event)) return;

  const eventType = (event as any).type;

  if (eventType === 'click' && isObject((event as any).target)) {
    // Narrowed to click event
    const target = (event as any).target as { id: string; x: number; y: number };
    console.log(`Clicked ${target.id} at (${target.x}, ${target.y})`);
  }

  if (eventType === 'submit' && isObject((event as any).data)) {
    // Narrowed to submit event
    const data = (event as any).data as Record<string, string>;
    console.log('Form submitted:', data);
  }
}
```

### Query Filters

```typescript
import { Predicate, not, and, or } from '@deessejs/fp';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  tags: string[];
}

// Product predicates
const isInStock: Predicate<Product> = p => p.inStock;
const isAffordable = (maxPrice: number): Predicate<Product> => p => p.price <= maxPrice;
const inCategory = (category: string): Predicate<Product> => p => p.category === category;
const hasTag = (tag: string): Predicate<Product> => p => p.tags.includes(tag);
const nameContains = (search: string): Predicate<Product> =>
  p => p.name.toLowerCase().includes(search.toLowerCase());

// Complex filter combinator
function createProductFilter(filters: {
  category?: string;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  inStockOnly?: boolean;
}): Predicate<Product> {
  const predicates: Predicate<Product>[] = [];

  if (filters.category) {
    predicates.push(inCategory(filters.category));
  }

  if (filters.maxPrice) {
    predicates.push(isAffordable(filters.maxPrice));
  }

  if (filters.tags?.length) {
    filters.tags.forEach(tag => predicates.push(hasTag(tag)));
  }

  if (filters.search) {
    predicates.push(nameContains(filters.search));
  }

  if (filters.inStockOnly) {
    predicates.push(isInStock);
  }

  return predicates.length > 0
    ? and(...predicates)
    : () => true;
}

// Usage
const filter = createProductFilter({
  category: 'electronics',
  maxPrice: 500,
  tags: ['sale', 'new'],
  inStockOnly: true,
});

const products = allProducts.filter(filter);
```

### Logical Combinators

```typescript
import { not, and, or } from '@deessejs/fp';

// Negation
const isNotEmpty = not((s: string) => s.length === 0);
const isNotAdmin = not((u: { role: string }) => u.role === 'admin');

// AND combination
const isValidAge = and(
  (n: number) => n >= 0,
  (n: number) => n <= 150,
);

const canVote = and(
  (u: { age: number }) => u.age >= 18,
  (u: { country: string }) => ['US', 'CA', 'UK'].includes(u.country),
);

// OR combination
const isWeekend = or(
  (d: Date) => d.getDay() === 0,
  (d: Date) => d.getDay() === 6,
);

const hasSpecialPermission = or(
  (u: { role: string }) => u.role === 'admin',
  (u: { permissions: string[] }) => u.permissions.includes('special'),
);

// Complex conditions
const canAccessPremium = and(
  (u: { isSubscribed: boolean }) => u.isSubscribed,
  or(
    (u: { role: string }) => u.role === 'admin',
    (u: { subscriptionTier: string }) => u.subscriptionTier === 'pro',
  ),
);

// Chaining
const isValidInput = and(
  (s: string) => s.length > 0,
  not((s: string) => s.includes(' ')), // No spaces
  not((s: string) => /[A-Z]/.test(s)), // No uppercase
);

// Multiple predicates
const validateEmail = and(
  (s: string) => s.includes('@'),
  (s: string) => s.indexOf('@') > 0,
  (s: string) => s.includes('.', s.indexOf('@')),
  not((s: string) => s.endsWith('.')),
);
```

## API Reference

### Types

```typescript
// A predicate is a function that returns a boolean
type Predicate<A> = (value: A) => boolean;

// A refinement is a type guard
type Refinement<A, B extends A> = (value: A) => value is B;
```

### Logical Combinators

```typescript
// Negates a predicate
function not<A>(predicate: Predicate<A>): Predicate<A>;

// Combines two predicates with AND
function and<A>(a: Predicate<A>, b: Predicate<A>): Predicate<A>;

// Combines multiple predicates with AND
function and<A>(...predicates: Predicate<A>[]): Predicate<A>;

// Combines two predicates with OR
function or<A>(a: Predicate<A>, b: Predicate<A>): Predicate<A>;

// Combines multiple predicates with OR
function or<A>(...predicates: Predicate<A>[]): Predicate<A>;

// Combines two predicates with XOR
function xor<A>(a: Predicate<A>, b: Predicate<A>): Predicate<A>;
```

### Utilities

```typescript
// Returns true always
function constTrue<A>(): Predicate<A>;

// Returns false always
function constFalse<A>(): Predicate<A>;

// Negates a refinement
function notRefinement<A, B extends A, C extends B>(
  refinement: Refinement<A, B>
): Refinement<A, Exclude<A, B>>;
```