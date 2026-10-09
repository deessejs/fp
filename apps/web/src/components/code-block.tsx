import type { ReactNode } from 'react';
import { highlight, type HighlightOptions } from 'fumadocs-core/highlight';
import { CopyButton } from '@/components/marketing/copy-button';
import { cn } from '@/lib/cn';

interface CodeBlockProps {
  code: string;
  language?: HighlightOptions['lang'];
  title?: string;
  size?: 'sm' | 'lg';
  footer?: ReactNode;
  unframed?: boolean;
  className?: string;
}

/** Highlight on the server; pass the rendered component through client slots. */
export async function CodeBlock({
  code,
  language = 'typescript',
  title,
  size = 'lg',
  footer,
  unframed = false,
  className,
}: CodeBlockProps) {
  const highlighted = await highlight(code, {
    lang: language,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
  return (
    <figure
      className={cn(
        'marketing-code m-0 min-w-0 bg-background',
        !unframed && 'border border-border',
        className
      )}
    >
      {title && (
        <figcaption className="flex min-h-12 items-center justify-between gap-3 border-b border-border pl-4 pr-1 sm:pl-6">
          <span className="min-w-0 font-mono text-label-13 text-muted-foreground">{title}</span>
          <CopyButton value={code} />
        </figcaption>
      )}
      <section
        className={cn(
          'marketing-code-scroll min-w-0 overflow-x-auto',
          size === 'sm' ? 'p-4' : 'p-4 sm:p-6'
        )}
        tabIndex={0}
        aria-label={`${title ?? language} code, scroll horizontally if needed`}
      >
        {highlighted}
      </section>
      {footer && <div className="border-t border-border px-4 py-3 sm:px-6">{footer}</div>}
    </figure>
  );
}
