import Link from 'next/link';

/**
 * Single column in the AppFooter grid.
 *
 * Renders a heading and a vertical list of links. Links that start
 * with `http://`, `https://`, or `mailto:` open in a new tab;
 * everything else uses the internal next/link. Mirrors
 * `deessejs/deessejs/apps/web/src/components/footers/footer-column.tsx`.
 */

export type FooterLink = {
  label: string;
  href: string;
};

export function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: ReadonlyArray<FooterLink>;
}) {
  return (
    <div>
      <h3 className="font-semibold text-fd-foreground mb-3">{heading}</h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:');
          const className =
            'text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors';
          return (
            <li key={link.label}>
              {isExternal ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
