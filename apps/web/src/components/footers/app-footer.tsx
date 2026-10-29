import Image from 'next/image';

import { GithubIcon } from '@/components/icons/brand';

import { ConwayBand } from './conway-grid';
import { FooterColumn, type FooterLink } from './footer-column';

const footerSections: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<FooterLink>;
}> = [
  {
    heading: 'Ecosystem',
    links: [
      { label: 'Errors', href: 'https://errors.deessejs.com' },
      { label: 'DRPC', href: 'https://drpc.deessejs.com' },
      { label: 'Collections', href: 'https://collections.deessejs.com' },
      { label: 'FP', href: 'https://fp.deessejs.com' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Docs', href: 'https://docs.deessejs.com' },
      { label: 'Blog', href: 'https://deessejs.com/blog' },
      { label: 'Changelog', href: 'https://deessejs.com/changelog' },
      { label: 'Knowledge Base', href: 'https://deessejs.com/knowledge-base' },
    ],
  },
  {
    heading: 'Use cases',
    links: [
      { label: 'SaaS apps', href: 'https://deessejs.com/use-cases/saas-apps' },
      { label: 'AI products', href: 'https://deessejs.com/use-cases/ai-products' },
      { label: 'Landing pages', href: 'https://deessejs.com/use-cases/landing-pages' },
      { label: 'API backends', href: 'https://deessejs.com/use-cases/api-backends' },
      { label: 'Internal tools', href: 'https://deessejs.com/use-cases/internal-tools' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: 'https://deessejs.com/about' },
      { label: 'Manifesto', href: 'https://deessejs.com/manifesto' },
      { label: 'Principles', href: 'https://deessejs.com/principles' },
      { label: 'Vision', href: 'https://deessejs.com/vision' },
      { label: 'Enterprise', href: 'https://deessejs.com/enterprise' },
      { label: 'Delivery', href: 'https://deessejs.com/delivery' },
      { label: 'Help', href: 'https://deessejs.com/help' },
    ],
  },
  {
    heading: 'Legal & Trust',
    links: [
      { label: 'Privacy', href: 'https://deessejs.com/privacy' },
      { label: 'Terms', href: 'https://deessejs.com/terms' },
      { label: 'Cookies', href: 'https://deessejs.com/cookies' },
      { label: 'DPA', href: 'mailto:support@deessejs.com?subject=DPA%20request' },
      { label: 'Security', href: 'mailto:support@deessejs.com' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Open Source Program', href: 'https://deessejs.com/oss' },
      { label: 'Github', href: 'https://github.com/deessejs' },
      { label: 'LinkedIn', href: '#' },
      { label: 'X', href: '#' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Customers', href: 'https://deessejs.com/customers' },
      { label: 'Templates', href: 'https://deessejs.com/templates' },
      { label: 'Ecosystem', href: 'https://deessejs.com/ecosystem' },
      { label: 'Stack', href: 'https://deessejs.com/stack' },
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/icon.svg"
                alt="DeesseJS logo"
                width={28}
                height={28}
                className="size-7"
              />
              <span className="text-lg font-semibold text-foreground">DeesseJS</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Software engineering as a commodity: agents that code, workflows that scale,
              infrastructure that works. Built with the DeesseJS ecosystem.
            </p>
          </div>

          {footerSections.map((section) => (
            <FooterColumn key={section.heading} heading={section.heading} links={section.links} />
          ))}
        </div>

        {/* Conway signature band — bleeds to the container max-width,
            separates from the section grid with a border-t. */}
        <div className="mt-12">
          <ConwayBand />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DeesseJS. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/deessejs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
