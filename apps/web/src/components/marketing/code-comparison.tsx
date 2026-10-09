import {
  CodeComparisonTabs,
  type CodeComparisonData,
  type CodeComparisonExample,
} from './code-comparison-tabs';
import { CodeHtmlBlock } from './code-html-block';

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
  return user ? some(user) : none;
}

findUser('abc')
  .map((user) => user.name)
  .getOrElse('Anonymous');

findUser('abc')
  .map((user) => user.email.toUpperCase())
  .match({
    some: (email) => console.log(email),
    none: () => {},
  });`,
  },
  {
    id: 'side-effects',
    label: 'Side effects',
    before: `function login(email: string, password: string): void {
  localStorage.setItem('token', '...')
}

login('a@b.com', 'secret')`,
    after: `import { unit, type Unit } from '@deessejs/fp';

const login = (email: string, password: string): Unit => {
  localStorage.setItem('token', '...')
  return unit
}

login('a@b.com', 'secret')`,
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
 * Shiki HTML at build time via the shared `<CodeHtmlBlock>`
 * component (the same one used elsewhere in the marketing
 * surface) and threads the rendered blocks into
 * `<CodeComparisonTabs>` (a Client Component) as ReactNodes.
 *
 * The reason we cannot call `<CodeBlock>` (the shared
 * component) directly from inside `<CodeComparisonTabs>` is
 * that `<CodeBlock>` is an async Server Component and Next 16
 * forbids rendering one as a child of a Client Component
 * (Radix Tabs has `"use client"`). The `<CodeHtmlBlock>`
 * helper that this file renders is itself a Server Component,
 * but we resolve it here on the server and pass the already-
 * rendered ReactNode down to the client wrapper, so the
 * `"use client"` boundary is never asked to render an async
 * Server Component.
 */
export async function CodeComparison() {
  const dataByExample = Object.fromEntries(
    await Promise.all(
      EXAMPLES.map(
        async (e) =>
          [
            e.id,
            {
              before: (
                <CodeHtmlBlock code={e.before} language="typescript" title={`${e.id}.before.ts`} />
              ),
              after: (
                <CodeHtmlBlock code={e.after} language="typescript" title={`${e.id}.after.ts`} />
              ),
            },
          ] as const
      )
    )
  ) as CodeComparisonData;

  const examples: ReadonlyArray<CodeComparisonExample> = EXAMPLES.map(({ id, label }) => ({
    id,
    label,
  }));

  return <CodeComparisonTabs examples={examples} dataByExample={dataByExample} />;
}
