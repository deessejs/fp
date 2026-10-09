import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { BenefitsGrid } from '@/components/marketing/benefits-grid';
import { CodeComparison } from '@/components/marketing/code-comparison';
import { ConceptsRow } from '@/components/marketing/concepts-row';
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

export default async function HomePage() {
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
              eyebrow="Why @deessejs/fp"
              title="Three things the library does for you"
              subtitle="Result, Maybe, and a small set of composition helpers. Each answers a question that TypeScript leaves open."
            />
            <BenefitsGrid />
            <ConceptsRow />
          </Section>

          <Section>
            <SectionHeader
              eyebrow="Before & after"
              title="From optional chaos to typed safety."
              subtitle="Stop relying on undefined checks and type assertions. Get type-safe, composable code that makes debugging a breeze."
            />
            <CodeComparison />
          </Section>

          <CtaCard noBorderB />
        </GlobalLayout>
      </main>
    </>
  );
}
