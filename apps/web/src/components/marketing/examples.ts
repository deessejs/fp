/** These snippets are compiled against the public API by check-marketing-examples.mjs. */
export const HERO_CODE = `import { ok, err, type Result } from '@deessejs/fp';

function parseAge(input: string): Result<number, string> {
  const age = Number(input);
  return input.trim() !== '' && Number.isInteger(age) && age >= 0
    ? ok(age)
    : err('Enter a valid age');
}

parseAge('22').match({
  ok: (age) => \`Age: \${age}\`,
  err: (error) => error,
});`;

export const COMPARISON_EXAMPLES = [
  {
    id: 'error-handling',
    label: 'Error handling',
    description:
      'Both versions handle division by zero. Result carries the reason for failure in its return type.',
    before: `function divide(a: number, b: number): number | undefined {
  if (b === 0) return undefined;
  return a / b;
}

const result = divide(10, 0);
const message = result !== undefined
  ? String(result)
  : 'Division by zero';`,
    after: `import { ok, err, type Result } from '@deessejs/fp';

function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err('Division by zero') : ok(a / b);
}

const message = divide(10, 0).match({
  ok: (value) => String(value),
  err: (error) => error,
});`,
  },
  {
    id: 'optional-values',
    label: 'Missing values',
    description:
      'Both versions look up the user once and return the same fallback. Maybe makes absence explicit before the transformation.',
    before: `type User = { id: string; name: string };
const users: User[] = [{ id: '1', name: 'Ada' }];

function findUser(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

const user = findUser('2');
const name = user?.name ?? 'Anonymous';`,
    after: `import { some, none, type Maybe } from '@deessejs/fp';

type User = { id: string; name: string };
const users: User[] = [{ id: '1', name: 'Ada' }];

function findUser(id: string): Maybe<User> {
  const user = users.find((user) => user.id === id);
  return user ? some(user) : none;
}

const name = findUser('2')
  .map((user) => user.name)
  .getOrElse('Anonymous');`,
  },
  {
    id: 'composition',
    label: 'Composition',
    description:
      'Both versions parse and validate an age. flatMap keeps the first failure while composing the successful path.',
    before: `function parseAge(input: string): number | undefined {
  const age = Number(input);
  if (input.trim() === '' || !Number.isInteger(age)) {
    return undefined;
  }
  return age;
}

const age = parseAge('22');
const message = age === undefined
  ? 'Enter an integer'
  : age < 18 ? 'Must be 18+' : \`Age: \${age}\`;`,
    after: `import { ok, err, type Result } from '@deessejs/fp';

function parseAge(input: string): Result<number, string> {
  const age = Number(input);
  return input.trim() !== '' && Number.isInteger(age)
    ? ok(age) : err('Enter an integer');
}

const message = parseAge('22')
  .flatMap((age) => age >= 18 ? ok(age) : err('Must be 18+'))
  .match({
    ok: (age) => \`Age: \${age}\`,
    err: (error) => error,
  });`,
  },
] as const;
