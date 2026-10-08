import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

type Primitive = {
  label: string;
  title: string;
  description: string;
  href: string;
};

type UseCase = {
  title: string;
  description: string;
  href: string;
};

const PRIMITIVES: ReadonlyArray<Primitive> = [
  {
    label: '01 — Primitive',
    title: 'Result Type',
    description:
      'Handle errors with type-safe success and failure states. No more undefined / null checks everywhere.',
    href: '/docs/result',
  },
  {
    label: '02 — Primitive',
    title: 'Maybe Type',
    description:
      'Work with optional values in a composable way. Explicitly handle the absence of values.',
    href: '/docs/maybe',
  },
  {
    label: '03 — Primitive',
    title: 'Unit Type',
    description:
      'Represent intentional void returns for side effects. Makes side effects explicit in your type signatures.',
    href: '/docs/unit',
  },
];

const USE_CASES: ReadonlyArray<UseCase> = [
  {
    title: 'Error Handling',
    description: 'Type-safe error propagation with the Result type.',
    href: '/docs/result',
  },
  {
    title: 'Optional Values',
    description: 'Handle null and undefined with the Maybe type.',
    href: '/docs/maybe',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation with examples.',
    href: '/docs/api-reference',
  },
];

/**
 * FeaturesGrid — two stacked sub-grids.
 *
 * Top: three primitives (Result, Maybe, Unit) in a 3-column grid
 * separated by `divide-x divide-border` (deessejs ForWho pattern).
 * Each card has an eyebrow, an H3, a body, and a "Learn more →"
 * footer aligned at the bottom by the `flex-1` on the body.
 *
 * Bottom: three use cases (Error Handling, Optional Values, API
 * Reference) in a 2x3 grid (deessejs CodingAgents pattern). Each
 * tile is a self-contained card with an H3 + body and a hover
 * state. Sits below the primitives so the visitor can scan the
 * three primitives first, then see what they unlock.
 */
export function FeaturesGrid() {
  return (
    <div className="flex flex-col">
      <PrimitivesGrid primitives={PRIMITIVES} />
      <UseCasesGrid useCases={USE_CASES} />
    </div>
  );
}

function PrimitivesGrid({ primitives }: { primitives: ReadonlyArray<Primitive> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-border md:divide-y-0 md:divide-x divide-border">
      {primitives.map((p) => (
        <Link
          key={p.title}
          href={p.href}
          aria-label={`${p.title}: ${p.description}`}
          className="group flex flex-col transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <p className="p-6 pb-0 text-label-13 text-muted-foreground">{p.label}</p>
          <h3 className="m-0 px-6 pt-2 text-heading-20 font-medium tracking-tight text-foreground">
            {p.title}
          </h3>
          <p className="flex-1 px-6 pt-2 text-copy-14 leading-6 text-muted-foreground [&:not(:first-child)]:mt-0">
            {p.description}
          </p>
          <p className="inline-flex items-center gap-1 px-6 pt-2 pb-6 text-label-13 text-foreground">
            Learn more
            <ArrowRight
              className="size-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </p>
        </Link>
      ))}
    </div>
  );
}

function UseCasesGrid({ useCases }: { useCases: ReadonlyArray<UseCase> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-border">
      {useCases.map((u, i) => (
        <Link
          key={u.title}
          href={u.href}
          className={cn(
            'group/uc relative flex flex-col gap-2 border-b border-border p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:p-8',
            // Inner right border on the first two cells of each row
            // (lg only) so the 2-col-on-sm grid reads as a proper
            // quadrillage at desktop. The third cell on lg already
            // has its right edge from the parent.
            i < useCases.length - 1 && 'lg:border-r'
          )}
        >
          <ArrowRight
            aria-hidden
            className="absolute right-4 top-4 size-4 shrink-0 text-muted-foreground transition-colors group-hover/uc:text-foreground lg:right-6 lg:top-6"
          />
          <h3 className="pr-6 text-heading-20 font-medium tracking-tight text-foreground">
            {u.title}
          </h3>
          <p className="text-copy-16 leading-7 text-muted-foreground [&:not(:first-child)]:mt-0">
            {u.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
