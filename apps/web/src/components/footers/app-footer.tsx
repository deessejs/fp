import Image from 'next/image';

import { FooterColumn, type FooterLink } from './footer-column';

/**
 * Site-wide footer for apps/web.
 *
 * Mirrors `deessejs/deessejs/apps/web/src/components/footers/app-footer.tsx`
 * with three local adaptations:
 *   - Brand is "@deessejs/fp" (the product this site documents),
 *     not the parent org name.
 *   - No `CookiePreferencesButton` (this repo does not depend on
 *     `@workspace/cookies`).
 *   - The Conway signature band is intentionally NOT included; it
 *     is a large component (~250 lines) and worth its own PR if it
 *     is wanted.
 *
 * Rendered once at apps/web/src/app/layout.tsx, outside the
 * GlobalLayout scope, so the card frame and dashed columns do not
 * apply to the footer.
 */

const footerSections: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<FooterLink>;
}> = [
  {
    heading: 'Ecosystem',
    links: [
      { label: 'Errors', href: 'https://errors.deessejs.com' },
      { label: 'FP', href: 'https://fp.deessejs.com' },
    ],
  },
  {
    heading: 'Learn',
    links: [{ label: 'Docs', href: '/docs' }],
  },
  {
    heading: 'Package',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@deessejs/fp' },
      { label: 'GitHub', href: 'https://github.com/deessejs/fp' },
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="border-t border-fd-border bg-fd-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/icon.svg"
                alt="@deessejs/fp logo"
                width={28}
                height={28}
                className="size-7"
              />
              <span className="text-lg font-semibold text-fd-foreground">@deessejs/fp</span>
            </div>
            <p className="text-sm text-fd-muted-foreground max-w-xs">
              Zero-dependency monads for bulletproof TypeScript applications. Result, Maybe, Poll,
              and Unit types with full type inference.
            </p>
          </div>

          {footerSections.map((section) => (
            <FooterColumn key={section.heading} heading={section.heading} links={section.links} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-fd-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-fd-muted-foreground">
            © {new Date().getFullYear()} DeesseJS. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/deessejs/fp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
