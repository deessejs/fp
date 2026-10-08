'use client';

import { ChevronRight, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const INSTALL_COMMAND = 'npm install @deessejs/fp';

/**
 * Final CTA at the bottom of the home page.
 *
 * Two-column grid (deessejs `_shared/final-cta.tsx` pattern):
 * the left cell carries the eyebrow + H2 + body, the right cell
 * stacks the actions vertically. The two cells are separated by
 * a `divide-x` on desktop, `divide-y` on mobile.
 *
 * The second action is a copy-to-clipboard button that swaps
 * to a "Copied!" state for 2 seconds on success. The button
 * label is the npm install command itself, so the click is
 * a "copy" gesture, not a "go install" gesture.
 */
export function CtaCard({
  noBorderB = false,
  className,
}: {
  /** Drop the bottom border. Use on the last section of a page
   *  so the surrounding frame (GlobalLayout, footer) closes the
   *  page cleanly without a double line. */
  noBorderB?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = INSTALL_COMMAND;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 divide-y divide-border border-t border-border lg:grid-cols-2 lg:divide-y-0 lg:divide-x',
        noBorderB && 'border-b-0',
        className
      )}
    >
      {/* Left: copy */}
      <div className="flex flex-col gap-4 p-6 lg:p-10">
        <p className="text-label-13 uppercase tracking-wider text-muted-foreground">Get started</p>
        <h2 className="text-heading-32 font-medium tracking-tight text-balance lg:text-heading-40 [&:not(:first-child)]:mt-0">
          Install the library. Read the docs.
        </h2>
        <p className="max-w-md text-copy-16 leading-7 text-muted-foreground [&:not(:first-child)]:mt-0">
          A small, ESM-only, peer-dependency-free library for typed functional programming in
          TypeScript. Result, Maybe, and Unit — typed, composable, and ready to ship.
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex flex-col items-stretch justify-center gap-4 p-6 lg:p-10">
        <Button asChild size="lg">
          <Link href="/docs">
            Read the docs
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={handleCopy} className="font-mono">
          {copied ? (
            <>
              <Check aria-hidden />
              Copied!
            </>
          ) : (
            <>
              <Copy aria-hidden />
              {INSTALL_COMMAND}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
