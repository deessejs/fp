/**
 * JSON Parsing with Result
 *
 * Demonstrates: ok/err constructors, mapError, pattern matching
 */

import { ok, err, Result } from '../src';

type ParseError = { readonly message: string };

function parseJSON(json: string): Result<unknown, ParseError> {
  try {
    return ok(JSON.parse(json));
  } catch (e) {
    return err({ message: e instanceof Error ? e.message : 'Unknown error' });
  }
}

// Usage
const result = parseJSON('{"name": "test"}');

result.match({
  ok: (data) => console.log('Parsed:', data),
  err: (e) => console.error('Parse failed:', e.message),
});