import { ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

import { CodeBlock } from '@/components/code-block';
import { InstallCommand } from '@/components/marketing/install-command';

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
 * Home hero — badge pill above, then a centered H1 + sub + an
 * `<InstallCommand>` segmented control (which doubles as the
 * CTA group: humans get `npm install`, agents get the
 * `npx skills` command), then a full-width code example.
 *
 * Layout (vercel/chat pattern):
 *   - Mobile (default): vertical stack, all centered.
 *   - lg: still centered. The H1 widens to `max-w-5xl`, the sub
 *     to `max-w-2xl`, the badge and the command picker sit
 *     centered above and below.
 *   - The code block spans the full width of the Section padding
 *     and sits below the centered header.
 *
 * Order: text first, code second. A screen reader walks the
 * narrative ("Introducing v5.0 → headline → sub → install
 * command → code example") in the same order a sighted
 * visitor scans the page.
 */
export function Hero() {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-16 text-center lg:gap-6 lg:px-8 lg:py-24">
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

      <h1 className="max-w-5xl text-center text-heading-40 font-medium tracking-tight text-balance md:text-heading-48 lg:text-heading-64 [&:not(:first-child)]:mt-0">
        Functional Programming,
        <br />
        Made Simple.
      </h1>

      <p className="w-full text-center text-copy-16 leading-7 text-muted-foreground text-balance md:max-w-2xl md:text-copy-18 lg:text-copy-20 [&:not(:first-child)]:mt-0">
        A TypeScript library that brings functional programming patterns to JavaScript. Result,
        Maybe, and Unit types for robust, composable code.
      </p>

      <InstallCommand />

      <CodeBlock language="typescript" title="example.ts" code={HERO_CODE} />
    </div>
  );
}
