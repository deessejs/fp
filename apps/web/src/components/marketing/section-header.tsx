import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * SectionHeader — eyebrow + H2 + subtitle, with an optional action
 * link in the top-right corner. Adopts the same visual contract as
 * the Surfaces / Contracts / Ecosystem headers on the deessejs SaaS
 * template: small caps eyebrow, balanced heading, muted body, an
 * arrow-link when there's a deeper route to push toward.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  bordered = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  /** When true, adds a `border-b border-border` under the header. */
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:px-8 lg:py-12',
        bordered && 'border-b border-border',
        className
      )}
    >
      <div className="flex max-w-3xl flex-col gap-3 lg:gap-4">
        {eyebrow && <p className="text-label-13 text-muted-foreground">{eyebrow}</p>}
        <h2 className="text-heading-32 font-medium tracking-tight text-balance lg:text-heading-40">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-2xl text-copy-16 leading-7 text-muted-foreground text-balance [&:not(:first-child)]:mt-0">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 self-start text-label-13 text-foreground transition-colors hover:underline underline-offset-4 lg:self-end"
        >
          {action.label}
          <ArrowUpRight aria-hidden className="size-3" />
        </Link>
      )}
    </div>
  );
}
