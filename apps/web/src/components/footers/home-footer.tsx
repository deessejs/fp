import { Package, Star } from 'lucide-react';

import { GithubIcon } from '@/components/icons/brand';

import { FooterColumn, type FooterLink } from './footer-column';

const FOOTER_GROUPS: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<FooterLink>;
}> = [
  {
    heading: 'Docs',
    links: [
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'Result', href: '/docs/result' },
      { label: 'Maybe', href: '/docs/maybe' },
      { label: 'Unit', href: '/docs/unit' },
      { label: 'API reference', href: '/docs/api-reference' },
    ],
  },
  {
    heading: 'Package',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@deessejs/fp' },
      { label: 'GitHub', href: 'https://github.com/deessejs/fp' },
      {
        label: 'Changelog',
        href: 'https://github.com/deessejs/fp/blob/main/packages/fp/CHANGELOG.md',
      },
      { label: 'License (MIT)', href: 'https://github.com/deessejs/fp/blob/main/LICENSE' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { label: 'Examples', href: '/docs/examples' },
      { label: 'Contributing', href: 'https://github.com/deessejs/fp/blob/main/CONTRIBUTING.md' },
      { label: 'Sister package: @deessejs/errors', href: 'https://errors.deessejs.com' },
      { label: 'deessejs ecosystem', href: 'https://deessejs.com' },
    ],
  },
];

/**
 * HomeFooter — the footer rendered on the `/` route.
 *
 * Intentionally narrower than `<AppFooter>`: the home page
 * only needs links that are relevant to `@deessejs/fp`. The
 * wider DeesseJS SaaS surface (pricing, use cases, manifesto,
 * privacy, etc.) is not present here. A visitor who lands on
 * `/` should be able to find any FP-related destination from
 * this footer in one click.
 */
export function HomeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-foreground">@deessejs/fp</p>
            <p className="mt-2 max-w-xs text-copy-13 text-muted-foreground">
              Result, Maybe, and Unit for TypeScript. Typed failures and explicit absence without
              the dependency weight.
            </p>
            <p className="mt-4 text-copy-13 text-muted-foreground">
              MIT licensed. Part of the deessejs ecosystem.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <FooterColumn key={group.heading} heading={group.heading} links={group.links} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-copy-13 text-muted-foreground">
            © {year} deessejs. The <code className="font-mono text-foreground">fp</code> package is
            released under the MIT license.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/deessejs/fp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href="https://www.npmjs.com/package/@deessejs/fp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="npm package"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Package className="size-5" aria-hidden />
            </a>
            <a
              href="https://github.com/deessejs/fp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Star on GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Star className="size-5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
