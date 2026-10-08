import { codeToHtml } from 'shiki';

import {
  CodeComparisonTabs,
  type CodeComparisonData,
  type CodeComparisonExample,
} from './code-comparison-tabs';

const EXAMPLES: ReadonlyArray<{
  id: string;
  label: string;
  before: string;
  after: string;
}> = [
  {
    id: 'error-handling',
    label: 'Error handling',
    before: `function divide(a: number, b: number): number | undefined {
  if (b === 0) return undefined;
  return a / b;
}

const result = divide(10, 0);
if (result !== undefined) {
  console.log(result);
} else {
  console.error('division by zero');
}`,
    after: `import { Result, ok, err } from '@deessejs/fp';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('Division by zero');
  return ok(a / b);
}

divide(10, 0).match({
  ok: (value) => console.log(value),
  err: (error) => console.error(error),
});`,
  },
  {
    id: 'optional-values',
    label: 'Optional values',
    before: `function findUser(id: string): User | null {
  const user = db.find(id);
  if (!user) return null;
  return user;
}

const user = findUser('abc');
const name = user ? user.name : 'Anonymous';
if (user) {
  console.log(user.email.toUpperCase());
}`,
    after: `import { some, none, Maybe } from '@deessejs/fp';

function findUser(id: string): Maybe<User> {
  const user = db.find(id);
  return user ? some(user) : none();
}

findUser('abc')
  .map((user) => user.name)
  .getWithDefault('Anonymous');

findUser('abc')
  .map((user) => user.email.toUpperCase())
  .forEach(console.log);`,
  },
  {
    id: 'side-effects',
    label: 'Side effects',
    before: `let isLoggedIn = false;

function login(email: string, password: string): void {
  // mutating module-level state, no signal
  isLoggedIn = true;
  localStorage.setItem('token', '...');
}

login('a@b.com', 'secret');
console.log(isLoggedIn); // true — but you have to know to look`,
    after: `import { unit, Unit } from '@deessejs/fp';

const login = (email: string, password: string): Unit => {
  localStorage.setItem('token', '...');
  return unit;
};

const session = login('a@b.com', 'secret');
// session is explicitly Unit. Side effects visible in the signature.`,
  },
  {
    id: 'validation',
    label: 'Validation',
    before: `type Form = { email: string; age: number };

function validate(input: Form): string | null {
  if (!input.email.includes('@')) return 'invalid email';
  if (input.age < 18) return 'must be 18+';
  return null;
}

const error = validate({ email: 'a@b.com', age: 17 });
if (error) {
  throw new Error(error);
}`,
    after: `import { Result, ok, err } from '@deessejs/fp';

type Form = { email: string; age: number };

const validate = (input: Form): Result<Form, string> => {
  if (!input.email.includes('@')) return err('invalid email');
  if (input.age < 18) return err('must be 18+');
  return ok(input);
};

const form = validate({ email: 'a@b.com', age: 17 });
form.match({
  ok: (data) => submitForm(data),
  err: (error) => showError(error),
});`,
  },
];

/**
 * CodeComparison — two-column code comparison on the home page.
 *
 * Server Component (async). Pre-renders every code snippet to
 * dual-theme Shiki HTML at build time and threads the result
 * into `<CodeComparisonTabs>` (a Client Component) as plain
 * strings, because Next 16 forbids rendering an async Server
 * Component as a child of a Client Component (Radix Tabs has
 * `"use client"`).
 *
 * The Tabs UI is the same on both sides; both are controlled
 * by the same `active` state held in the client wrapper, so
 * the visitor always sees the before/after for the same use
 * case in lockstep.
 *
 * `defaultColor: false` is mandatory: without it Shiki emits
 * inline `color` styles that win over the CSS variables in
 * `globals.css`, and dark mode would not flip.
 */
export async function CodeComparison() {
  const highlighted = await Promise.all(
    EXAMPLES.map(async (e) => {
      const [beforeHtml, afterHtml] = await Promise.all([
        codeToHtml(e.before, {
          lang: 'typescript',
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        }),
        codeToHtml(e.after, {
          lang: 'typescript',
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        }),
      ]);
      return [e.id, { before: beforeHtml, after: afterHtml }] as const;
    })
  );
  const dataByExample = Object.fromEntries(highlighted) as CodeComparisonData;

  const examples: ReadonlyArray<CodeComparisonExample> = EXAMPLES.map(({ id, label }) => ({
    id,
    label,
  }));

  return <CodeComparisonTabs examples={examples} dataByExample={dataByExample} />;
}
