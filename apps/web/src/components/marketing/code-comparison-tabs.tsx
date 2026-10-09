'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CodeComparisonExample = {
  id: string;
  label: string;
};

export type CodeComparisonData = Record<string, { before: string; after: string }>;

/**
 * Client-side Tabs control for the home page code comparison.
 *
 * Single shadcn `<Tabs>` root with a single `<TabsList>` at the
 * top. For each example there are two `<TabsContent>` elements
 * (one for the "before" snippet, one for the "after" snippet),
 * both with the same `value`. Radix renders every
 * `<TabsContent>` whose `value` matches the active tab, so all
 * four examples are mounted up front and the visitor sees both
 * the before and the after of the active example side by side.
 *
 * The actual code blocks are pre-rendered by Shiki in the
 * parent Server Component and arrive here as a
 * `dataByExample` map of HTML strings. We render them with
 * `dangerouslySetInnerHTML` so the shadcn Tabs state can flip
 * between them on the client without re-hitting Shiki.
 */
export function CodeComparisonTabs({
  examples,
  dataByExample,
}: {
  examples: ReadonlyArray<CodeComparisonExample>;
  dataByExample: CodeComparisonData;
}) {
  const [active, setActive] = useState<string>(examples[0].id);

  return (
    <Tabs value={active} onValueChange={setActive} className="flex flex-col gap-6 p-6 lg:p-8">
      <TabsList className="self-center">
        {examples.map((e) => (
          <TabsTrigger key={e.id} value={e.id}>
            {e.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-border">
        {examples.map((e) => (
          <TabsContent key={`${e.id}-before`} value={e.id} className="lg:pr-8">
            <CodeHtmlBlock title={`${e.id}.before.ts`} html={dataByExample[e.id].before} />
          </TabsContent>
        ))}
        {examples.map((e) => (
          <TabsContent key={`${e.id}-after`} value={e.id} className="lg:pl-8">
            <CodeHtmlBlock title={`${e.id}.after.ts`} html={dataByExample[e.id].after} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

function CodeHtmlBlock({ title, html }: { title: string; html: string }) {
  return (
    <div className="bg-background w-full overflow-hidden rounded-none border border-border">
      {title && (
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-full bg-red-500/80" />
          <span className="size-2.5 rounded-full bg-yellow-500/80" />
          <span className="size-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 font-mono">{title}</span>
        </div>
      )}
      <div
        className="overflow-x-auto p-3 text-xs [&_pre]:!bg-transparent [&_pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
