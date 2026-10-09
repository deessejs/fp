import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Concept = {
  label: string;
  title: string;
  description: string;
  href: string;
};

const CONCEPTS: ReadonlyArray<Concept> = [
  {
    label: 'Primitive',
    title: 'Result',
    description: 'A success or a failure, with the error as a value.',
    href: '/docs/result',
  },
  {
    label: 'Primitive',
    title: 'Maybe',
    description: 'A present value or the absence of one. Nothing else.',
    href: '/docs/maybe',
  },
  {
    label: 'Primitive',
    title: 'Unit',
    description: 'A value for functions that must return something.',
    href: '/docs/unit',
  },
];

/**
 * ConceptsRow — three reference entries for the primitives.
 *
 * Intentionally lighter than the benefits grid. These are
 * pointers to the docs, not pitches. The benefit story is
 * told by `<BenefitsGrid>`; the concepts are the table of
 * contents behind it.
 */
export function ConceptsRow() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {CONCEPTS.map((c) => (
        <Link
          key={c.title}
          href={c.href}
          className="group flex flex-col gap-1 p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:p-8"
        >
          <p className="text-label-13 text-muted-foreground">{c.label}</p>
          <h3 className="m-0 text-heading-20 font-medium tracking-tight text-foreground">
            {c.title}
          </h3>
          <p className="text-copy-14 leading-6 text-muted-foreground">{c.description}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-label-13 text-foreground">
            Read the docs
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
