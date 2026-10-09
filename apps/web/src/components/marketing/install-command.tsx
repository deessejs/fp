'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';

const COMMANDS = {
  humans: 'npm install @deessejs/fp',
  agents: 'npx skills add deessejs/fp',
} as const;

type Audience = keyof typeof COMMANDS;

/**
 * Install command picker — a segmented control ("For humans" /
 * "For agents") over a pill-shaped terminal-style command line
 * with a copy-to-clipboard button on the right.
 *
 * Mirrors the vercel/chat install row: two text tabs separated
 * by a 1px divider, no active background (the active state is
 * just a font-weight + color shift), and a single rounded-full
 * pill that holds the `$ <command>` plus a circular copy
 * button. The pill picks the command based on the active tab.
 *
 * `navigator.clipboard.writeText` is called on copy. Older
 * browsers and insecure contexts (http) silently no-op rather
 * than throw, which matches the vercel/chat behavior.
 */
export function InstallCommand() {
  const [audience, setAudience] = React.useState<Audience>('humans');
  const [copied, setCopied] = React.useState(false);
  const command = COMMANDS[audience];

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Insecure context or permission denied — fail silently.
    }
  }, [command]);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div role="tablist" aria-label="Install audience" className="inline-flex items-center">
        <AudienceTab
          label="For humans"
          active={audience === 'humans'}
          onClick={() => setAudience('humans')}
          minWidth={90}
        />
        <div aria-hidden className="h-3 w-px bg-border" />
        <AudienceTab
          label="For agents"
          active={audience === 'agents'}
          onClick={() => setAudience('agents')}
          minWidth={84}
        />
      </div>

      <div className="group relative flex max-w-[calc(100vw-48px)] items-center gap-1 rounded-full border border-border bg-background py-1 pl-5 pr-1 transition-colors">
        <span aria-hidden className="text-sm text-muted-foreground">
          $
        </span>
        <span className="block min-w-0 truncate py-2 font-mono text-sm text-foreground">
          {command}
        </span>
        <button
          type="button"
          aria-label={copied ? 'Copied' : 'Copy command'}
          onClick={onCopy}
          className="flex size-8 shrink-0 translate-x-0.5 items-center justify-center rounded-full bg-transparent text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {copied ? (
            <Check aria-hidden className="size-4 text-emerald-500" />
          ) : (
            <Copy aria-hidden className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function AudienceTab({
  label,
  active,
  onClick,
  minWidth,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  minWidth: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-active={active ? '' : undefined}
      onClick={onClick}
      style={{ minWidth }}
      className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border-none bg-transparent px-3 py-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-active:font-medium data-active:text-foreground"
    >
      {label}
    </button>
  );
}
