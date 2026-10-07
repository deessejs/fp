import * as React from 'react';

/**
 * Marketing page wrapper, used by the home page only.
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
 * Scope: the home route only. Other surfaces (docs, etc.) are not
 * wrapped with this component; their layout is the default
 * fumadocs-ui one. The component lives in `components/marketing/`
 * because it is part of the marketing surface identity, not a
 * generic app shell.
 *
 * The file name `global-layout` is kept (rather than renamed) for
 * continuity with the deessejs/deessejs source it mirrors.
 *
 * Mirrors `apps/web/src/components/layouts/global-layout.tsx` in
 * `deessejs/deessejs` so the fp marketing surface reads as part of
 * the deessejs SaaS product surface.
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
