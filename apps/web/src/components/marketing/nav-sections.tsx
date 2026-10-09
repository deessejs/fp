'use client';

import Link from 'next/link';
import { Accordion, NavigationMenu } from 'radix-ui';

import { cn } from '@/lib/cn';

type NavItem = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

type NavCategory = {
  label: string;
  items: ReadonlyArray<NavItem>;
};

type NavSection = {
  label: string;
  href?: string;
  external?: boolean;
  categories?: ReadonlyArray<NavCategory>;
};

/**
 * Single source of truth for the home page nav. Both the desktop
 * Radix NavigationMenu and the mobile drawer read from this list.
 *
 * The shape mirrors the deessejs main site so a future merge is
 * mechanical. The items are repointed at the FP surface: internal
 * links go to `/docs/...` (this site), the rest go to
 * `*.deessejs.com` (the SaaS surface) and open in a new tab.
 */
const NAV_SECTIONS: ReadonlyArray<NavSection> = [
  {
    label: 'Products',
    categories: [
      {
        label: 'Templates',
        items: [
          {
            label: 'Getting started',
            href: '/docs/getting-started',
            description: 'Install, set up, write your first Result',
          },
          {
            label: 'API reference',
            href: '/docs/api-reference',
            description: 'Every export, every signature',
          },
        ],
      },
      {
        label: 'Ecosystem',
        items: [
          {
            label: 'Errors',
            href: 'https://errors.deessejs.com',
            description: 'Structured error tracking',
            external: true,
          },
          {
            label: 'DRPC',
            href: 'https://drpc.deessejs.com',
            description: 'Durable RPC for agent workflows',
            external: true,
          },
          {
            label: 'Collections',
            href: 'https://collections.deessejs.com',
            description: 'Type-safe data access',
            external: true,
          },
          {
            label: 'UI',
            href: 'https://ui.deessejs.com',
            description: 'Component library',
            external: true,
          },
        ],
      },
      {
        label: 'FP surface',
        items: [
          {
            label: 'Examples',
            href: '/#examples',
            description: 'Before/After comparisons',
          },
          {
            label: 'Changelog',
            href: 'https://github.com/deessejs/fp/blob/main/packages/fp/CHANGELOG.md',
            description: 'Release notes and version history',
            external: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    categories: [
      {
        label: 'Learn',
        items: [
          { label: 'Result', href: '/docs/result', description: 'Typed success and failure' },
          { label: 'Maybe', href: '/docs/maybe', description: 'Explicit absence' },
          { label: 'Unit', href: '/docs/unit', description: 'A value for empty returns' },
        ],
      },
      {
        label: 'Use cases',
        items: [
          {
            label: 'Error handling',
            href: '/#examples',
            description: 'Same task, explicit outcomes',
          },
          {
            label: 'Validation',
            href: '/#examples',
            description: 'Parse input without throw/catch',
          },
        ],
      },
      {
        label: 'Explore',
        items: [
          {
            label: 'GitHub',
            href: 'https://github.com/deessejs/fp',
            description: 'Source, issues, releases',
            external: true,
          },
          {
            label: 'npm',
            href: 'https://www.npmjs.com/package/@deessejs/fp',
            description: 'The published package',
            external: true,
          },
        ],
      },
    ],
  },
  { label: 'Enterprise', href: 'https://deessejs.com/enterprise', external: true },
  { label: 'Pricing', href: 'https://deessejs.com/pricing', external: true },
];

/** Local replacement for the shadcn `navigationMenuTriggerStyle()` helper. */
const navigationMenuTriggerStyle = () =>
  cn(
    'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50'
  );

export const isNavActive = (pathname: string, href: string): boolean => {
  if (href === '/') return pathname === '/';
  if (href.startsWith('#') || href.startsWith('http')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

const externalProps = (external?: boolean) =>
  external ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : ({} as const);

export function NavSections({
  pathname,
  variant,
}: {
  pathname: string;
  variant: 'desktop' | 'mobile';
}) {
  if (variant === 'desktop') {
    return (
      <NavigationMenu.Root aria-label="Primary">
        <NavigationMenu.List className="fp-nav-list flex items-center gap-1">
          {NAV_SECTIONS.map((section) =>
            section.categories ? (
              <DesktopDropdown key={section.label} section={section} />
            ) : (
              <DesktopLink key={section.label} section={section} pathname={pathname} />
            )
          )}
        </NavigationMenu.List>

        <NavigationMenu.Viewport className="fp-nav-viewport" />
      </NavigationMenu.Root>
    );
  }

  const productsSection = NAV_SECTIONS.find((s) => s.label === 'Products');
  const resourcesSection = NAV_SECTIONS.find((s) => s.label === 'Resources');
  const generalLinks = NAV_SECTIONS.filter(
    (s) => s.label !== 'Products' && s.label !== 'Resources' && Boolean(s.href)
  );

  return (
    <nav aria-label="Primary mobile" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="fp-mobile-eyebrow">General</h3>
        <ul className="flex flex-col gap-3">
          {generalLinks.map((section) => (
            <li key={section.label}>
              <Link
                href={section.href ?? '#'}
                className={cn(
                  'text-sm font-medium',
                  isNavActive(pathname, section.href ?? '')
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                {...externalProps(section.external)}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {productsSection?.categories ? (
        <MobileSection heading="Products" categories={productsSection.categories} />
      ) : null}

      {resourcesSection?.categories ? (
        <MobileSection heading="Resources" categories={resourcesSection.categories} />
      ) : null}
    </nav>
  );
}

function MobileSection({
  heading,
  categories,
}: {
  heading: string;
  categories: ReadonlyArray<NavCategory>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="fp-mobile-eyebrow">{heading}</h3>
      <Accordion.Root type="multiple" className="w-full">
        {categories.map((category) => (
          <Accordion.Item
            key={category.label}
            value={`${heading}-${category.label}`}
            className="border-b border-border"
          >
            <Accordion.Header>
              <Accordion.Trigger className="fp-mobile-trigger">
                {category.label}
                <span aria-hidden className="fp-mobile-chevron">
                  +
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="fp-mobile-content">
              <ul className="flex flex-col gap-2 pb-1">
                {category.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground transition-colors hover:text-foreground/70"
                      {...externalProps(item.external)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

function DesktopLink({ section, pathname }: { section: NavSection; pathname: string }) {
  const active = section.href ? isNavActive(pathname, section.href) : false;
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link
          href={section.href ?? '#'}
          className={cn(
            navigationMenuTriggerStyle(),
            'px-2.5',
            'text-muted-foreground hover:text-foreground focus-visible:text-foreground',
            active && 'text-foreground'
          )}
          {...externalProps(section.external)}
        >
          {section.label}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

function DesktopDropdown({ section }: { section: NavSection }) {
  const columnCount = section.categories?.length ?? 1;
  const widthClass = columnCount >= 3 ? 'w-[640px]' : columnCount === 2 ? 'w-[480px]' : 'w-[280px]';

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        className={cn(
          navigationMenuTriggerStyle(),
          'px-2.5',
          'text-muted-foreground hover:text-foreground data-[state=open]:text-foreground'
        )}
      >
        {section.label}
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className={cn('fp-nav-content grid gap-6 p-4', widthClass)}>
        <ul
          className={cn(
            'grid gap-6',
            columnCount === 1 && 'grid-cols-1',
            columnCount === 2 && 'grid-cols-2',
            columnCount >= 3 && 'grid-cols-3'
          )}
        >
          {section.categories?.map((category) => (
            <li key={category.label}>
              <DesktopCategoryColumn category={category} />
            </li>
          ))}
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function DesktopCategoryColumn({ category }: { category: NavCategory }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="fp-nav-eyebrow">{category.label}</span>
      <ul className="flex flex-col gap-1">
        {category.items.map((item) => (
          <li key={item.label}>
            <NavigationMenu.Link asChild>
              <Link
                href={item.href}
                className="fp-nav-item group"
                {...externalProps(item.external)}
              >
                <span className="text-sm font-medium">{item.label}</span>
                {item.description ? (
                  <span className="fp-nav-item-desc">{item.description}</span>
                ) : null}
              </Link>
            </NavigationMenu.Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
