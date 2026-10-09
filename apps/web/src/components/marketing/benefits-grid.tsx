import { ArrowRight, GitMerge, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Benefit = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};

const BENEFITS: ReadonlyArray<Benefit> = [
  {
    title: 'Typed failures',
    description:
      'Functions that can fail say so in their return type. The error is a value, not an exception to catch across module boundaries.',
    href: '/docs/result',
    icon: ShieldAlert,
  },
  {
    title: 'Explicit absence',
    description:
      'Values that may be missing are typed as `Maybe<T>`. No more `null` and `undefined` surprises scattered through the code.',
    href: '/docs/maybe',
    icon: Sparkles,
  },
  {
    title: 'Composition',
    description:
      'Pipe the helpers through `flatMap` to chain fallible operations. The error is preserved through the chain — no early returns, no throw/catch.',
    href: '/docs/result#flatMap',
    icon: GitMerge,
  },
];

/**
 * BenefitsGrid — three short benefit cards.
 *
 * Each card answers a single question: "what does the library
 * do for me?" — typed failures, explicit absence, composition.
 * No code samples in the cards: the demonstration lives in the
 * Before/After section. The destination is a real docs page.
 *
 * Layout: a 1-col stack on mobile, 3 equal columns from `sm:`.
 * The cards are square (rounded-none) and joined by `divide-y
 * divide-border` on mobile, `divide-y-0 sm:divide-x` on larger
 * screens. Heights are intrinsic — the cards grow to their
 * content, no `grid-rows-*` constraint.
 */
export function BenefitsGrid() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {BENEFITS.map((b) => (
        <Link
          key={b.title}
          href={b.href}
          aria-label={`${b.title}: ${b.description}`}
          className="group flex flex-col gap-3 p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:p-8"
        >
          <b.icon className="size-5 text-foreground" aria-hidden />
          <h3 className="m-0 text-heading-20 font-medium tracking-tight text-foreground">
            {b.title}
          </h3>
          <p className="text-copy-14 leading-6 text-muted-foreground">{b.description}</p>
          <p className="mt-auto inline-flex items-center gap-1 pt-2 text-label-13 text-foreground">
            Read the guide
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
