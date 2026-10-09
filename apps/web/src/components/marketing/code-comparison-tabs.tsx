'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CodeComparisonExample = {
  id: string;
  label: string;
};

export type CodeComparisonData = Record<
  string,
  { before: React.ReactNode; after: React.ReactNode }
>;

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
 * The actual code blocks are pre-rendered by the parent Server
 * Component (via the shared `<CodeHtmlBlock>`) and arrive here
 * as ReactNodes. We cannot call `<CodeBlock>` (or render
 * `<CodeHtmlBlock>` directly) from inside this Client
 * Component because both are async Server Components and Next
 * 16 forbids rendering one as a child of a Client Component.
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
    <Tabs value={active} onValueChange={setActive} className="flex flex-col">
      <div className="flex justify-center border-b border-border pb-4">
        <TabsList>
          {examples.map((e) => (
            <TabsTrigger key={e.id} value={e.id}>
              {e.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2 lg:gap-0 lg:p-8 lg:divide-x lg:divide-border">
        {examples.map((e) => (
          <TabsContent key={`${e.id}-before`} value={e.id}>
            {dataByExample[e.id].before}
          </TabsContent>
        ))}
        {examples.map((e) => (
          <TabsContent key={`${e.id}-after`} value={e.id}>
            {dataByExample[e.id].after}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
