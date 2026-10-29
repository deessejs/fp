import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/marketing/copy-button';
import { cn } from '@/lib/cn';

export function CtaCard({
  noBorderB = false,
  className,
}: {
  noBorderB?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0',
        !noBorderB && 'border-b border-border',
        className
      )}
      aria-labelledby="get-started-heading"
    >
      <div className="flex flex-col gap-4 p-6 md:p-8 lg:p-10">
        <p className="home-eyebrow">Get started</p>
        <h2
          id="get-started-heading"
          className="text-heading-32 font-medium leading-[1.15] tracking-tight text-balance lg:text-heading-40"
        >
          Make the next outcome explicit.
        </h2>
        <p className="max-w-md text-copy-16 leading-7 text-muted-foreground">
          Install the package and start with Result or Maybe. Explore the API as you need it.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 md:p-8 lg:p-10">
        <Button asChild size="lg" className="home-button">
          <Link href="/docs/getting-started">
            Read the docs
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
        <div className="flex min-w-0 items-center justify-between gap-2 border border-border pl-4 pr-1">
          <code
            tabIndex={0}
            className="min-w-0 overflow-x-auto whitespace-nowrap font-mono text-copy-13"
          >
            npm install @deessejs/fp
          </code>
          <CopyButton value="npm install @deessejs/fp" label="Copy install command" iconOnly />
        </div>
      </div>
    </section>
  );
}
