import { codeToHtml } from 'shiki';

import { cn } from '@/lib/cn';

/**
 * Pre-rendered Shiki code block for use inside Client Components.
 *
 * The shared `<CodeBlock>` component (in `components/code-block.tsx`)
 * is an async Server Component. Next 16 forbids rendering an
 * async Server Component as a child of a Client Component, so
 * we cannot use `<CodeBlock>` from inside the shadcn `<Tabs>`
 * wrapper in `<CodeComparisonTabs>`.
 *
 * The workaround: this component runs the same `codeToHtml` call
 * Server-side (here) and returns a pre-rendered block that the
 * Client Component can mount as a plain React tree. The Shiki
 * HTML is laid down at build time, so the client never re-runs
 * the highlighter.
 *
 * The chrome (traffic lights + filename bar + `bg-background`
 * wrapper + `border border-border`) is intentionally identical
 * to `<CodeBlock>` so the two read as the same surface in the
 * Hero and in the Before/After section.
 */
export async function CodeHtmlBlock({
  code,
  language = 'typescript',
  title,
  className,
}: {
  code: string;
  language?: 'typescript' | 'tsx' | 'javascript' | 'jsx' | 'bash' | 'json';
  title?: string;
  className?: string;
}) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  });

  return (
    <div
      className={cn(
        'h-full bg-background w-full overflow-hidden rounded-none border border-border',
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[13px] text-muted-foreground">{title}</span>
        </div>
      )}
      <div
        className="p-3 text-xs [&_pre]:!bg-transparent [&_pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
