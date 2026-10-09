'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CodeComparisonTabs({
  examples,
}: {
  examples: ReadonlyArray<{
    id: string;
    label: string;
    description: string;
    before: ReactNode;
    after: ReactNode;
  }>;
}) {
  return (
    <Tabs defaultValue={examples[0]?.id} className="gap-0">
      <div className="min-w-0 overflow-x-auto border-b border-border px-6 md:px-8 lg:px-10">
        <TabsList
          aria-label="Code examples"
          className="h-auto justify-start gap-6 rounded-none bg-transparent p-0"
        >
          {examples.map((example) => (
            <TabsTrigger
              key={example.id}
              value={example.id}
              className="min-h-12 flex-none rounded-none border-b-2 border-transparent px-0 py-3 text-label-13 text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {examples.map((example) => (
        <TabsContent key={example.id} value={example.id} className="min-w-0">
          <p className="border-b border-border bg-muted/30 px-6 py-4 text-copy-14 leading-6 text-muted-foreground md:px-8 lg:px-10">
            {example.description}
          </p>
          <div className="grid min-w-0 grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {example.before}
            {example.after}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
