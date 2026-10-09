import { ArrowRight, CircleCheck, CircleSlash, Play, Shapes } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

type IconType = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type Primitive = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon: IconType;
};

type UseCase = {
  label: string;
  title: string;
  description: string;
  href: string;
};

const PRIMITIVES: ReadonlyArray<Primitive> = [
  {
    label: '01 — Primitive',
    title: 'Maybe',
    description: 'Optional values, handled explicitly. No more `null` and `undefined` surprises.',
    href: '/docs/maybe',
    icon: Shapes,
  },
  {
    label: '02 — Primitive',
    title: 'Result',
    description:
      'Type-safe success and failure states. Errors are part of the signature, not a side channel.',
    href: '/docs/result',
    icon: CircleCheck,
  },
];

const USE_CASES: ReadonlyArray<UseCase> = [
  {
    label: '01 — Use case',
    title: 'Error handling',
    description:
      'Stop throwing across module boundaries. Compose fallible operations without losing the error.',
    href: '/docs/result',
  },
  {
    label: '02 — Use case',
    title: 'Optional values',
    description:
      'Replace every `if (x != null)` with a chain of `.map`, `.filter`, `.getWithDefault`.',
    href: '/docs/maybe',
  },
];

const BOTTOM_TILES = [
  {
    label: '03 — Primitive',
    title: 'Unit',
    description: 'Intentional `void` returns for side effects. Visible in the type signature.',
    href: '/docs/unit',
    icon: CircleSlash,
  },
  {
    label: '04 — Live',
    title: 'match() in 3 lines',
    description: 'Branch on ok/err in one expression. The error is preserved through the chain.',
    href: '/docs/result#match',
    icon: Play,
  },
] as const;

const LIVE_SNIPPET = `ok(42).match({
  ok: (n) => n * 2,
  err: () => 0,
}) // → 84`;

/**
 * FeaturesGrid — 2-column bento.
 *
 *   ┌──────────┬──────────┐
 *   │  Maybe   │  Result  │   row 1 (2 simple primitives)
 *   ├──────────┴──────────┤
 *   │                     │
 *   │   Error    Optional │   rows 2-3 (2 tall use cases, row-span-2)
 *   │                     │
 *   ├──────────┬──────────┤
 *   │   Unit   │  match() │   row 4 (Unit + Live demo)
 *   └──────────┴──────────┘
 *
 * Each tile is a self-contained card with an eyebrow, an H3, a
 * body, an icon, and a footer link. The middle row uses
 * `row-span-2` so the two use-case tiles stretch across two
 * rows. The bento is `grid-cols-2 grid-rows-3` with `gap-4`
 * between tiles — no `border-b` / `divide-x` rhythm, the gap
 * itself is the separator.
 *
 * On mobile (default `grid-cols-1`) the tall row collapses to a
 * pair of normal-height tiles, so the visual order is:
 * Maybe → Result → Error → Optional → Unit → match().
 */
export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 grid-rows-6 gap-4 p-6 sm:grid-cols-2 sm:grid-rows-3 lg:p-8">
      {PRIMITIVES.map((p) => (
        <BentoTile key={p.title} {...p} />
      ))}
      {USE_CASES.map((u) => (
        <BentoTile
          key={u.title}
          {...u}
          className="sm:row-span-2"
          bodyClassName="text-copy-16 leading-7"
        />
      ))}
      {BOTTOM_TILES.map((t) => (
        <BentoTile key={t.title} {...t} />
      ))}
    </div>
  );
}

type BentoTileProps = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon?: IconType;
  live?: boolean;
  className?: string;
  bodyClassName?: string;
};

function BentoTile({
  label,
  title,
  description,
  href,
  icon: Icon,
  live = false,
  className,
  bodyClassName,
}: BentoTileProps) {
  return (
    <Link
      href={href}
      aria-label={`${title}: ${description}`}
      className={cn(
        'group relative flex flex-col rounded-none border border-border bg-background p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-label-13 text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      </div>

      <h3 className="m-0 mt-3 text-heading-20 font-medium tracking-tight text-foreground">
        {title}
      </h3>

      <p
        className={cn(
          'mt-2 flex-1 text-copy-14 leading-6 text-muted-foreground [&:not(:first-child)]:mt-0',
          bodyClassName
        )}
      >
        {description}
      </p>

      {live && (
        <pre className="mt-4 overflow-x-auto rounded-none border border-border bg-muted/30 p-3 font-mono text-xs leading-5 text-foreground">
          {LIVE_SNIPPET}
        </pre>
      )}

      <p className="mt-4 inline-flex items-center gap-1 text-label-13 text-foreground">
        Learn more
        <ArrowRight
          className="size-3 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </p>
    </Link>
  );
}
