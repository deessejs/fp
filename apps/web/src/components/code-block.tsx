import type { BundledLanguage } from 'shiki';

import { highlightCode } from '@/lib/shiki';

interface CodeBlockProps {
  code: string;
  language?: BundledLanguage;
  title?: string;
  size?: 'sm' | 'lg';
  tabs?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'p-3 text-xs',
  lg: 'p-6 text-sm',
};

export async function CodeBlock({
  code,
  language = 'typescript',
  title,
  size = 'sm',
  tabs = true,
  className,
}: CodeBlockProps) {
  const html = await highlightCode(code, language);

  return (
    <div
      className={`h-full bg-background w-full overflow-hidden rounded-none border border-border ${className ?? ''}`}
    >
      {title && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/30">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[13px] text-muted-foreground">{title}</span>
        </div>
      )}
      <div className={`${sizeClasses[size]}`} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
