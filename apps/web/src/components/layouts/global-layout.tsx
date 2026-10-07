import * as React from 'react';

/**
 * Global page wrapper for every public surface on `apps/web`.
 *
 * Applied once at `apps/web/src/app/layout.tsx` so it frames every
 * route rendered under `<main>` uniformly. Pages do not need to
 * import or wrap with this component themselves; the layout root
 * does it.
 *
 * Provides:
 *   - Outer container (padding + responsive widths via the `container`
 *     utility).
 *   - Shared-border card outline that frames the page content.
 *   - Two thin diagonal-stripe columns rendered flush against the
 *     inner card on `xl:` viewports, giving a subtle "annotated" feel
 *     (left/right of the card, not at the viewport edges).
 *
 * The diagonal-stripe pattern is `repeating-linear-gradient(315deg, ...)`
 * on 10x10 px tiles. The width of each column is 40 px (`w-10`). The
 * columns are `xl:block` (visible at >= 1280 px viewport width).
 *
 * Mirrors the pattern from `deessejs/deessejs`
 * (apps/web/src/components/layouts/global-layout.tsx) so the fp
 * docs site reads as part of the deessejs SaaS product surface.
 */
export function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto container px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="relative border border-border bg-background rounded-none">
        {children}
        {/* Left diagonal stripe column, flush against the inner card's
            left edge, sitting on the border itself. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-10 -translate-x-full border-y border-l border-border bg-[repeating-linear-gradient(315deg,var(--border)_0,var(--border)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] xl:block"
        />
        {/* Right diagonal stripe column, flush against the inner card's
            right edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-10 translate-x-full border-y border-r border-border bg-[repeating-linear-gradient(315deg,var(--border)_0,var(--border)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] xl:block"
        />
      </div>
    </div>
  );
}
