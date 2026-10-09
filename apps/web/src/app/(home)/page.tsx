import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { AppFooter } from '@/components/footers/app-footer';
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

      <GlobalLayout>
        <main id="home-content">
          <Section>
            <Hero />
          </Section>

          <Section>
            <SectionHeader
              eyebrow="Why FP"
              title="Make every outcome visible."
              subtitle="Keep the successful path readable, without leaving failures or missing values implicit."
            />
            <BenefitsGrid />
          </Section>

          <Section id="examples">
            <SectionHeader
              eyebrow="Before & after"
              title="Same task. Explicit outcomes."
              subtitle="Compare ordinary TypeScript with FP on a small, complete example. Choose the representation that fits your code."
            />
            <CodeComparison />
          </Section>

          <Section>
            <SectionHeader
              eyebrow="The primitives"
              title="Small types. Clear contracts."
              subtitle="Start with Result and Maybe. Use Unit when a function needs an explicit value for an otherwise empty return."
              action={{ href: '/docs/api-reference', label: 'API reference' }}
            />
            <ConceptsRow />
          </Section>

          <CtaCard noBorderB />
        </main>
      </GlobalLayout>
      <AppFooter />
    </>
  );
}
