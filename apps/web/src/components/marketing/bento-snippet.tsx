import { highlightCode } from '@/lib/shiki';

/**
 * Pre-rendered Shiki code snippet for a bento tile.
 *
 * Server Component (async). Renders a small inline `<pre>` with
 * the same `bg-muted/30 border border-border` chrome as the rest
 * of the marketing code blocks, sized for the tile (xs font,
 * tighter padding than the hero `CodeBlock`).
 *
 * The pre-rendered HTML is laid down at build time, then
 * `dangerouslySetInnerHTML` injects it. The class hooks on the
 * Shiki output override the default `background-color` so the
 * snippet blends with the tile's `bg-muted/30` chrome instead
 * of showing Shiki's own background.
 *
 * The shiki CSS variables (`--shiki-light`, `--shiki-dark`,
 * `--shiki-light-bg`, `--shiki-dark-bg`) are picked up by the
 * `.shiki` selectors in `global.css` to flip the colors in dark
 * mode.
 */
export async function BentoSnippet({ code }: { code: string }) {
  const html = await highlightCode(code, 'typescript');
  return (
    <div
      className="mt-4 flex-1 overflow-x-auto border border-border bg-muted/30 p-3 text-xs leading-5 [&_pre]:!bg-transparent [&_pre]:!p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
