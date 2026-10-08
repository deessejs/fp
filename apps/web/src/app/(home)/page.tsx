import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { CodeBlock } from '@/components/code-block';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { GlobalLayout } from '@/components/marketing/global-layout';
import { Hero } from '@/components/marketing/hero';
import { Section } from '@/components/marketing/section';
import { SectionHeader } from '@/components/marketing/section-header';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: '@deessejs/fp — Functional Programming for TypeScript',
  description:
    '@deessejs/fp is a TypeScript library bringing functional programming patterns to JavaScript. Result, Maybe, and Unit types for robust, composable code.',
  keywords: [
    'typescript functional programming',
    'result type typescript',
    'maybe type typescript',
    'option type javascript',
    'error handling typescript',
    'fp typescript',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: '@deessejs/fp',
    title: '@deessejs/fp — Functional Programming for TypeScript',
    description:
      'A TypeScript library bringing functional programming patterns to JavaScript. Result, Maybe, and Unit types for robust, composable code.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '@deessejs/fp — Functional Programming for TypeScript',
    description: 'A TypeScript library bringing functional programming patterns to JavaScript.',
    creator: '@nesalia_inc',
  },
  alternates: {
    canonical: baseUrl,
  },
};

// Before/After comparison
const BEFORE_CODE = `// Traditional approach
function divide(a: number, b: number): number | undefined {
  if (b === 0) return undefined;
  return a / b;
}

const result = divide(10, 0);
if (result !== undefined) {
  console.log(result);
}`;

const AFTER_CODE = `// @deessejs/fp approach
import { Result, ok, err } from '@deessejs/fp';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('Division by zero');
  return ok(a / b);
}

divide(10, 0).match({
  ok: (value) => console.log(value),
  err: (error) => console.error(error),
});`;

export default function HomePage() {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '@deessejs/fp',
    description:
      'TypeScript functional programming library with Result, Maybe, and Unit types for robust, composable code.',
    url: baseUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Node.js 18+',
    programmingLanguage: {
      '@type': 'ComputerLanguage',
      name: 'TypeScript',
    },
    license: 'MIT',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    downloadUrl: 'https://www.npmjs.com/package/@deessejs/fp',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <main>
        <GlobalLayout>
          <Section>
            <Hero />
          </Section>

          <Section>
            <SectionHeader
              eyebrow="The primitives"
              title="Features"
              subtitle="Everything you need for robust functional programming in TypeScript. Result, Maybe, and Unit types for typed, composable code."
            />
            <FeaturesGrid />
          </Section>

          <Section>
            <SectionHeader
              eyebrow="Before & after"
              title="From optional chaos to typed safety."
              subtitle="Stop relying on undefined checks and type assertions. Get type-safe, composable code that makes debugging a breeze."
            />
            <div className="grid gap-6 p-6 lg:grid-cols-2 lg:gap-8 lg:p-8">
              <CodeBlock language="typescript" title="before.ts" code={BEFORE_CODE} />
              <CodeBlock language="typescript" title="after.ts" code={AFTER_CODE} />
            </div>
          </Section>

          <CtaCard noBorderB />
        </GlobalLayout>
      </main>
    </>
  );
}
