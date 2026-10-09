'use client';

import { Menu } from 'lucide-react';
import { Popover } from 'radix-ui';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { NavSections } from './nav-sections';

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
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
        className="fp-mobile-menu z-50 w-80 max-w-[calc(100vw-32px)] border border-border bg-background p-4 shadow-sm"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('a')) setOpen(false);
        }}
      >
        <NavSections pathname={pathname} variant="mobile" />
      </Popover.Content>
    </Popover.Root>
  );
}
