import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * Section — the shared-border wrapper for every homepage section.
 *
 * Poses a `border-b border-border` separator, a centered container
 * (max-w-6xl, matching the page content), and responsive horizontal
 * padding. Sits inside the <GlobalLayout> card on the home page, so
 * it adds its own border-b to keep the stacked-band rhythm of the
 * site even when the surrounding card frame is hidden on other
 * routes.
 */
export function Section({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('border-b border-border', className)} {...props} />;
}
