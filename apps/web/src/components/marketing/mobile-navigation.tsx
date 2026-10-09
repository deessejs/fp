'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useState } from 'react';

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label="Open navigation menu"
        className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-accent md:hidden"
      >
        <Menu className="size-4" aria-hidden />
      </Popover.Trigger>
      <Popover.Content
        sideOffset={8}
        align="end"
        className="fp-mobile-menu z-50 w-64 max-w-[calc(100vw-32px)] border border-border bg-background p-2 shadow-sm"
      >
        <nav aria-label="Mobile navigation">
          {[
            { href: '/docs', text: 'Documentation' },
            { href: '/#examples', text: 'Examples' },
            { href: 'https://github.com/deessejs/fp', text: 'GitHub' },
            { href: 'https://deessejs.com', text: 'DeesseJS ecosystem' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-accent"
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </Popover.Content>
    </Popover.Root>
  );
}
