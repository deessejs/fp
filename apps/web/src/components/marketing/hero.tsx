import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { InstallCommand } from './install-command';
import { HERO_CODE } from './examples';

export function Hero() {
  return (
    <div className="px-6 pb-12 pt-16 md:px-8 sm:pb-16 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="font-mono text-label-13 uppercase leading-4 tracking-wider text-muted-foreground">
          DeesseJS FP
        </p>
        <h1 className="mt-6 text-heading-40 font-medium leading-[1.08] tracking-[-0.04em] text-balance sm:text-heading-48 lg:text-heading-56">
          Handle failures and missing values explicitly.
        </h1>
        <p className="mt-6 max-w-2xl text-copy-16 leading-7 text-muted-foreground text-pretty sm:text-copy-18">
          Result and Maybe for TypeScript. Make success, failure and absence part of your types,
          then compose the next step.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="home-button">
            <Link href="/docs/getting-started">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="home-button">
            <Link href="#examples">
              View examples
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
        <InstallCommand className="mt-5" />
      </div>
      <CodeBlock
        code={HERO_CODE}
        title="parse-age.ts"
        className="mx-auto mt-10 max-w-5xl lg:mt-12"
        footer={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-copy-13 leading-5">
            <span className="text-muted-foreground">Result</span>
            <span>
              parseAge('22') <span className="text-muted-foreground">→</span> Age: 22
            </span>
            <span className="text-muted-foreground">parseAge('') → Enter a valid age</span>
          </div>
        }
      />
    </div>
  );
}
