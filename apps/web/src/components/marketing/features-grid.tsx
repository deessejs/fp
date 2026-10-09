import { ArrowRight, CircleCheck, CircleSlash, GitMerge, Shapes } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

type IconType = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type Primitive = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon: IconType;
  snippet: string;
};

type UseCase = {
  label: string;
  title: string;
  description: string;
  href: string;
  snippet: string;
};

const PRIMITIVES: ReadonlyArray<Primitive> = [
  {
    label: '01 — Primitive',
    title: 'Maybe',
    description: 'Optional values, handled explicitly. No more `null` and `undefined` surprises.',
    href: '/docs/maybe',
    icon: Shapes,
    snippet: 'some(42).map((n) => n * 2) // Some(84)',
  },
  {
    label: '02 — Primitive',
    title: 'Result',
    description:
      'Type-safe success and failure states. Errors are part of the signature, not a side channel.',
    href: '/docs/result',
    icon: CircleCheck,
    snippet: 'ok(42).map((n) => n * 2) // Ok(84)',
  },
];

const USE_CASES: ReadonlyArray<UseCase> = [
  {
    label: '01 — Use case',
    title: 'Error handling',
    description:
      'Stop throwing across module boundaries. Compose fallible operations without losing the error.',
    href: '/docs/result',
    snippet: `ok(21).flatMap((n) =>
  n > 10 ? ok(n * 2) : err('too small'),
) // Ok(42)`,
  },
  {
    label: '02 — Use case',
    title: 'Optional values',
    description:
      'Replace every `if (x != null)` with a chain of `.map`, `.filter`, `.getWithDefault`.',
    href: '/docs/maybe',
    snippet: `findUser('abc')
  .map((u) => u.name)
  .getWithDefault('Anonymous')`,
  },
];

const BOTTOM_TILES = [
  {
    label: '03 — Primitive',
    title: 'Unit',
    description: 'Intentional `void` returns for side effects. Visible in the type signature.',
    href: '/docs/unit',
    icon: CircleSlash,
    snippet: `const login = (
  email: string,
  password: string,
): Unit => {
  localStorage.setItem('token', '...')
  return unit
}`,
  },
  {
    label: '04 — Composable',
    title: 'Pipe match → map',
    description: 'Every helper composes. The error is preserved through the chain.',
    href: '/docs/result#match',
    icon: GitMerge,
    snippet: `ok(42)
  .match({ ok: (n) => n, err: () => 0 })
  .map((n) => n * 2) // 84`,
  },
] as const;

/**
 * FeaturesGrid — 2-column bento, no gap, no padding, every
 * tile shows a short code snippet between its description and
 * the "Learn more" footer.
 *
 *   ┌──────────┬──────────┐
 *   │  Maybe   │  Result  │   row 1 (2 simple primitives)
 *   ├──────────┴──────────┤
 *   │                     │
 *   │   Error    Optional │   rows 2-3 (2 tall use cases, row-span-2)
 *   │                     │
 *   ├──────────┬──────────┤
 *   │   Unit   │  match() │   row 4 (Unit + Composable example)
 *   └──────────┴──────────┘
 *
 * The grid is `gap-0 p-0` so the tiles touch each other. Each
 * tile carries its own `border-r border-b border-border`; the
 * last tile in each row drops `border-r` and the last row drops
 * `border-b` so the bento reads as a single 2x3 quadrillage
 * flush with the surrounding card frame.
 *
 * The middle row uses `row-span-2` so the two use-case tiles
 * stretch across two rows. The grid itself is `grid-cols-2
 * grid-rows-3` (sm:). On mobile the grid collapses to
 * `grid-cols-1 grid-rows-6` and the tall row becomes two
 * normal-height tiles, so the visual order stays:
 * Maybe → Result → Error → Optional → Unit → Pipe.
 */
export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 grid-rows-6 sm:grid-cols-2 sm:grid-rows-3">
      {PRIMITIVES.map((p, i) => (
        <BentoTile key={p.title} {...p} isLastInRow={i % 2 === 1} isLastRow={i >= 2} />
      ))}
      {USE_CASES.map((u, i) => (
        <BentoTile
          key={u.title}
          {...u}
          className="sm:row-span-2"
          bodyClassName="text-copy-16 leading-7"
          isLastInRow={i % 2 === 1}
          isLastRow
        />
      ))}
      {BOTTOM_TILES.map((t, i) => (
        <BentoTile key={t.title} {...t} isLastInRow={i % 2 === 1} isLastRow />
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
  snippet: string;
  className?: string;
  bodyClassName?: string;
  /** True for the right column of a row — drops the right border. */
  isLastInRow?: boolean;
  /** True for the bottom row — drops the bottom border. */
  isLastRow?: boolean;
};

function BentoTile({
  label,
  title,
  description,
  href,
  icon: Icon,
  snippet,
  className,
  bodyClassName,
  isLastInRow = false,
  isLastRow = false,
}: BentoTileProps) {
  return (
    <Link
      href={href}
      aria-label={`${title}: ${description}`}
      className={cn(
        'group relative flex flex-col bg-background p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:p-8',
        // On mobile every tile is the only one in its row, so it
        // never needs a right border. On sm+ we add `border-r` to
        // every tile, then `sm:border-r-0` overrides for the right
        // column.
        'border-b border-border sm:border-r',
        isLastInRow && 'sm:border-r-0',
        isLastRow && 'border-b-0',
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
          'mt-2 text-copy-14 leading-6 text-muted-foreground [&:not(:first-child)]:mt-0',
          bodyClassName
        )}
      >
        {description}
      </p>

      <pre className="mt-4 flex-1 overflow-x-auto border border-border bg-muted/30 p-3 font-mono text-xs leading-5 text-foreground">
        {snippet}
      </pre>

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
