import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  {
    title: 'Handle failure',
    description:
      'Return a success or an error. Keep the failure visible in the type and handle both outcomes where they matter.',
    href: '/docs/result',
  },
  {
    title: 'Handle absence',
    description:
      'Represent a value that might be missing. Transform it when present and choose a fallback when absent.',
    href: '/docs/maybe',
  },
  {
    title: 'Compose safely',
    description:
      'Chain transformations with map and flatMap. Continue on success and preserve the first failure along the way.',
    href: '/docs/result#flatmap-chain',
  },
] as const;

export function BenefitsGrid() {
  return (
    <div className="grid min-w-0 grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
      {BENEFITS.map((benefit) => (
        <article key={benefit.title} className="flex min-w-0 flex-col p-6 md:p-8 lg:p-10">
          <h3 className="text-heading-20 font-medium leading-7 tracking-tight">{benefit.title}</h3>
          <p className="mt-3 text-copy-16 leading-7 text-muted-foreground">{benefit.description}</p>
          <Link
            href={benefit.href}
            className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-label-13 hover:underline underline-offset-4"
          >
            Read the guide
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </article>
      ))}
    </div>
  );
}
