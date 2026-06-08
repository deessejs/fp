/**
 * User Profile with Result + Maybe
 *
 * Demonstrates: Result wrapping Maybe, error hierarchies
 */

import { ok, err, some, none, maybe, Result, Maybe } from '../src';

// Error types
interface NotFoundError {
  readonly _tag: 'NotFoundError';
  readonly id: string;
}

interface ValidationError {
  readonly _tag: 'ValidationError';
  readonly reason: string;
}

function notFoundError(id: string): NotFoundError {
  return { _tag: 'NotFoundError', id };
}

function validationError(reason: string): ValidationError {
  return { _tag: 'ValidationError', reason };
}

interface User {
  id: string;
  name: string;
  email?: string;
}

// Simulated database
const users = new Map([
  ['1', { id: '1', name: 'Alice', email: 'alice@example.com' }],
  ['2', { id: '2', name: 'Bob' }], // no email
]);

function findUser(id: string): Maybe<User> {
  return maybe(users.get(id));
}

function getUserEmail(id: string): Result<string, NotFoundError | ValidationError> {
  const user = findUser(id);

  if (user.isNone()) {
    return err(notFoundError(id));
  }

  return user.value.email !== undefined
    ? ok(user.value.email)
    : err(validationError('No email on file'));
}

// Usage
const result = getUserEmail('1');
result.match({
  ok: (email) => console.log('Email:', email), // Email: alice@example.com
  err: (e) => console.error('Error:', e),
});

// Also works with @deessejs/errors when installed:
// import { error, is } from '@deessejs/errors';
// const NotFoundError = error({ name: 'NotFoundError', message: 'User "{id}" not found' });
// Then: is(e, NotFoundError) to check type