import { ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';

const HERO_CODE = `import { ok, err, some, none, unit } from '@deessejs/fp';

// Result type - handle errors gracefully
const result = ok(42).map((n) => n * 2); // Ok(84)
const failed = err('oops').map((n) => n * 2); // Err('oops')

// Maybe type - handle optional values
const value = some(42).filter((n) => n > 10); // Some(42)
const empty = none<number>().map((n) => n * 2); // None

// Compose with flatMap
const composed = ok(21)
  .flatMap((n) => (n > 10 ? ok(n * 2) : err('too small')))`;

/**
 * Home hero — H1 with a badge pill above, sub-copy + CTAs in a row,
 * then a code example. The badge is the deessejs "Introducing X"
 * pattern: a small clickable chip above the H1 that routes to the
 * latest changelog or release note. Tells the visitor the project
 * is alive before they read the title.
 */
export function Hero() {
  return (
    <div className="flex flex-col gap-10 px-6 py-16 lg:gap-14 lg:px-8 lg:py-24">
      {/* Top: badge + H1, left-aligned, full width */}
      <div className="flex flex-col items-start gap-5 lg:gap-6">
        <Link
          href="/changelog"
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 shadow-sm transition-colors hover:bg-accent/40"
        >
          <Layers className="size-4 shrink-0 text-foreground" aria-hidden />
          <span className="truncate text-sm font-normal text-foreground">
            Introducing v5.0 — first stable ESM release
          </span>
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />
        </Link>

        <h1 className="max-w-4xl text-heading-40 font-medium tracking-tight text-balance sm:text-heading-48 lg:text-heading-56 [&:not(:first-child)]:mt-0">
          Functional Programming,
          <br />
          Made Simple.
        </h1>

        <p className="max-w-2xl text-copy-16 leading-7 text-muted-foreground text-balance sm:text-copy-18 [&:not(:first-child)]:mt-0">
          A TypeScript library that brings functional programming patterns to JavaScript. Result,
          Maybe, and Unit types for robust, composable code.
        </p>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild size="lg">
            <Link href="/docs">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background hover:bg-accent/40">
            <Link href="/docs/getting-started">npm install @deessejs/fp</Link>
          </Button>
        </div>
      </div>

      {/* Code example */}
      <CodeBlock language="typescript" title="example.ts" code={HERO_CODE} />
    </div>
  );
}
