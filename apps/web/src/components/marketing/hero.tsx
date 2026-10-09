import Link from 'next/link';

import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { InstallCommand } from '@/components/marketing/install-command';

const HERO_CODE = `import { ok, err, type Result } from '@deessejs/fp';

function parseAge(input: string): Result<number, string> {
  const age = Number(input);
  if (input.trim() === '' || !Number.isInteger(age) || age < 0) {
    return err('Enter a valid age');
  }
  return ok(age);
}

parseAge('22').match({
  ok: (age) => \`Age: \${age}\`,
  err: (error) => error,
});`;

/**
 * Home hero — centered header (H1 + sub) above two CTAs (a
 * "Get started" link to the docs and an `<InstallCommand>`
 * for the install line) and a single full-width `<CodeBlock>`
 * that demonstrates a small, complete use case.
 *
 * The H1 leads with what the library does for the visitor
 * (handle failures and missing values), not the category of
 * the library (functional programming). The sub copy names
 * the two primitives the visitor will encounter first and
 * what they unlock. The snippet is a single self-contained
 * `parseAge` example that goes through both branches of a
 * `Result.match`, so the reader can see the same code
 * working in the happy path and the error path.
 *
 * Layout:
 *   - Mobile (default): vertical stack, all centered.
 *   - lg: still centered. The H1 widens to `max-w-4xl` (the
 *     benefit is a single line, no need for a wider canvas).
 *     The sub copies to `max-w-2xl`. The CTAs and the
 *     `<CodeBlock>` cap at `max-w-5xl`.
 *   - The parent flex column does not use `items-center`;
 *     each child centers itself via `self-center` (H1, sub,
 *     InstallCommand, CTA group) or `mx-auto` (CodeBlock).
 *
 * Order: text first, code second. A screen reader walks the
 * narrative (headline → sub → CTAs → install command → code
 * example) in the same order a sighted visitor scans the
 * page.
 */
export function Hero() {
  return (
    <div className="flex flex-col gap-5 px-6 py-16 lg:gap-6 lg:px-8 lg:py-24">
      <h1 className="max-w-4xl self-center text-center text-heading-40 font-medium tracking-tight text-balance md:text-heading-48 lg:text-heading-56">
        Handle failures and missing values explicitly.
      </h1>

      <p className="w-full self-center text-center text-copy-16 leading-7 text-muted-foreground text-balance md:max-w-2xl md:text-copy-18">
        Result and Maybe for TypeScript. Operations that can fail say so in their type. Values that
        may be absent say so too. The rest of the code handles both branches.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Button asChild size="lg">
          <Link href="/docs">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-background hover:bg-accent/40">
          <Link href="/docs/examples">View examples</Link>
        </Button>
      </div>

      <InstallCommand className="self-center" />

      <CodeBlock
        language="typescript"
        title="parseAge.ts"
        code={HERO_CODE}
        className="mx-auto w-full max-w-5xl"
      />
    </div>
  );
}
