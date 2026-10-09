import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const CONCEPTS = [
  {
    title: 'Result',
    type: 'Result<T, E>',
    description:
      'A success carrying T or a failure carrying E. Transform either branch and handle the outcome with match.',
    href: '/docs/result',
  },
  {
    title: 'Maybe',
    type: 'Maybe<T>',
    description:
      'A present value or none. Map the value, chain another lookup or provide an explicit fallback.',
    href: '/docs/maybe',
  },
  {
    title: 'Unit',
    type: 'Unit',
    description:
      'A single value for an operation with no meaningful return value. It does not manage or isolate side effects.',
    href: '/docs/unit',
  },
] as const;

export function ConceptsRow() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
      {CONCEPTS.map((concept) => (
        <article key={concept.title} className="flex min-w-0 flex-col p-6 md:p-8 lg:p-10">
          <code className="mb-5 font-mono text-copy-13 text-muted-foreground">{concept.type}</code>
          <h3 className="text-heading-24 font-medium leading-8 tracking-tight">{concept.title}</h3>
          <p className="mt-3 text-copy-16 leading-7 text-muted-foreground">{concept.description}</p>
          <Link
            href={concept.href}
            className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-label-13 hover:underline underline-offset-4"
          >
            Explore {concept.title}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </article>
      ))}
    </div>
  );
}
