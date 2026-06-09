import Link from "next/link";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { CtaCard } from "@/components/cta-card";
import { Footer } from "@/components/footer";
import { baseUrl } from "@/lib/shared";

export const metadata: Metadata = {
  title: "@deessejs/fp — Functional Programming for TypeScript",
  description:
    "@deessejs/fp is a TypeScript library bringing functional programming patterns to JavaScript. Result, Maybe, and Unit types for robust, composable code.",
  keywords: [
    "typescript functional programming",
    "result type typescript",
    "maybe type typescript",
    "option type javascript",
    "error handling typescript",
    "fp typescript",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "@deessejs/fp",
    title: "@deessejs/fp — Functional Programming for TypeScript",
    description:
      "A TypeScript library bringing functional programming patterns to JavaScript. Result, Maybe, and Unit types for robust, composable code.",
  },
  twitter: {
    card: "summary_large_image",
    title: "@deessejs/fp — Functional Programming for TypeScript",
    description:
      "A TypeScript library bringing functional programming patterns to JavaScript.",
    creator: "@nesalia_inc",
  },
  alternates: {
    canonical: baseUrl,
  },
};

// Hero code example
const HERO_CODE = `import { ok, err, some, none, unit } from '@deessejs/fp';

// Result type - handle errors gracefully
const result = ok(42).map((n) => n * 2); // Ok(84)
const failed = err('oops').map((n) => n * 2); // Err('oops')

// Maybe type - handle optional values
const value = some(42).filter((n) => n > 10); // Some(42)
const empty = none<number>().map((n) => n * 2); // None

// Compose with flatMap
const composed = ok(21)
  .flatMap((n) => (n > 10 ? ok(n * 2) : err('too small')));`;

// Features data
const features = [
  {
    title: "Result Type",
    description:
      "Handle errors with type-safe success and failure states. No more undefined/null checks everywhere.",
    href: "/docs/result",
  },
  {
    title: "Maybe Type",
    description:
      "Work with optional values in a composable way. Explicitly handle the absence of values.",
    href: "/docs/maybe",
  },
  {
    title: "Unit Type",
    description:
      "Represent intentional void returns for side effects. Makes side effects explicit in your type signatures.",
    href: "/docs/unit",
  },
  {
    title: "TypeScript Native",
    description:
      "Full type safety with generic types. Leverage TypeScript to catch errors before they happen.",
    href: "/docs/getting-started",
  },
];

// Code examples for showcase
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
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "@deessejs/fp",
    description:
      "TypeScript functional programming library with Result, Maybe, and Unit types for robust, composable code.",
    url: baseUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Node.js 18+",
    programmingLanguage: {
      "@type": "ComputerLanguage",
      name: "TypeScript",
    },
    license: "MIT",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl: "https://www.npmjs.com/package/@deessejs/fp",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 pt-20 lg:pt-28 pb-8 relative z-10">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-fd-foreground">
              Functional Programming,
              <br />
              Made Simple.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-fd-muted-foreground">
              A TypeScript library that brings functional programming patterns
              to JavaScript. Result, Maybe, and Unit types for robust, composable
              code.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2.5 bg-fd-primary hover:bg-fd-primary/90 rounded-none px-5 py-3 text-sm font-medium text-fd-primary-foreground transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2.5 border border-fd-border hover:border-fd-accent bg-fd-card hover:bg-fd-accent/50 rounded-none px-5 py-3 text-sm font-medium text-fd-muted-foreground transition-colors"
              >
                npm install @deessejs/fp
              </Link>
            </div>
          </div>
        </section>

        {/* Hero Code Section */}
        <section className="relative z-10">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <CodeBlock language="typescript" title="example.ts" code={HERO_CODE} />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-fd-background-secondary">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-fd-foreground">
                Features
              </h2>
              <p className="mt-4 text-lg text-fd-muted-foreground leading-relaxed">
                Everything you need for robust functional programming in
                TypeScript.
              </p>
            </div>

            <div className="mt-10 grid lg:grid-cols-6 gap-5">
              {/* Feature cards - spans 3 columns each */}
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="lg:col-span-3 border border-fd-border bg-fd-card hover:border-fd-accent hover:bg-fd-secondary rounded-none p-6 transition-colors"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-fd-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] text-fd-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              ))}

              {/* Secondary features - spans 2 columns */}
              <Link
                href="/docs/result"
                className="lg:col-span-2 border border-fd-border bg-fd-card hover:border-fd-accent hover:bg-fd-secondary rounded-none p-6 transition-colors"
              >
                <h3 className="text-xl font-semibold tracking-tight text-fd-foreground">
                  Error Handling
                </h3>
                <p className="mt-1.5 text-[15px] text-fd-muted-foreground leading-relaxed">
                  Type-safe error propagation with the Result type.
                </p>
              </Link>

              <Link
                href="/docs/maybe"
                className="lg:col-span-2 border border-fd-border bg-fd-card hover:border-fd-accent hover:bg-fd-secondary rounded-none p-6 transition-colors"
              >
                <h3 className="text-xl font-semibold tracking-tight text-fd-foreground">
                  Optional Values
                </h3>
                <p className="mt-1.5 text-[15px] text-fd-muted-foreground leading-relaxed">
                  Handle null/undefined with the Maybe type.
                </p>
              </Link>

              <Link
                href="/docs/api-reference"
                className="lg:col-span-2 border border-fd-border bg-fd-card hover:border-fd-accent hover:bg-fd-secondary rounded-none p-6 transition-colors"
              >
                <h3 className="text-xl font-semibold tracking-tight text-fd-foreground">
                  API Reference
                </h3>
                <p className="mt-1.5 text-[15px] text-fd-muted-foreground leading-relaxed">
                  Complete API documentation with examples.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Before/After Comparison */}
        <section className="bg-fd-background">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-fd-foreground">
                From optional chaos to typed safety.
              </h2>
              <p className="mt-4 text-lg text-fd-muted-foreground leading-relaxed">
                Stop relying on undefined checks and type assertions. Get
                type-safe, composable code that makes debugging a breeze.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Before */}
              <CodeBlock
                language="typescript"
                title="before.ts"
                code={BEFORE_CODE}
              />

              {/* After */}
              <CodeBlock language="typescript" title="after.ts" code={AFTER_CODE} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CtaCard />

        <Footer />
      </main>
    </>
  );
}