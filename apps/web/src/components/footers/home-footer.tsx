import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DeessejsMark } from '@/components/icons/brand';

const GROUPS = [
  {
    title: 'Documentation',
    links: [
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'Result', href: '/docs/result' },
      { label: 'Maybe', href: '/docs/maybe' },
      { label: 'API reference', href: '/docs/api-reference' },
    ],
  },
  {
    title: 'Package',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@deessejs/fp' },
      { label: 'GitHub', href: 'https://github.com/deessejs/fp' },
      {
        label: 'Changelog',
        href: 'https://github.com/deessejs/fp/blob/main/packages/fp/CHANGELOG.md',
      },
      { label: 'MIT license', href: 'https://github.com/deessejs/fp/blob/main/LICENSE' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'DeesseJS', href: 'https://deessejs.com' },
      { label: '@deessejs/errors', href: 'https://errors.deessejs.com' },
      { label: 'Examples', href: '/#examples' },
    ],
  },
] as const;

export function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="grid grid-cols-1 gap-y-8 p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-4 lg:gap-8 lg:p-10">
        <div className="pr-4">
          <Link
            href="/"
            className="inline-flex min-h-8 items-center gap-2.5 text-label-14 font-medium"
          >
            <DeessejsMark className="h-[18px] w-5" />
            deessejs / fp
          </Link>
          <p className="mt-4 max-w-xs text-copy-14 leading-6 text-muted-foreground">
            Typed failures and explicit absence for TypeScript.
          </p>
          <a
            href="https://deessejs.com"
            className="mt-4 inline-flex min-h-8 items-center gap-1 text-label-13 text-muted-foreground hover:text-foreground"
          >
            Part of DeesseJS
            <ArrowUpRight className="size-3" aria-hidden />
          </a>
        </div>
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="mb-3 text-label-13 font-medium">{group.title}</h3>
            <ul className="space-y-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-8 items-center text-copy-13 text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-5 text-copy-13 leading-5 text-muted-foreground md:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} DeesseJS</p>
        <p>Open source. MIT licensed.</p>
      </div>
    </footer>
  );
}
