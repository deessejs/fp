import { codeToHtml, type BundledLanguage } from 'shiki';

/**
 * Shared Shiki configuration for the home page code blocks.
 *
 * The same options must apply everywhere we render a code
 * sample so that:
 *   - Dark mode flips the syntax colors via the CSS variables
 *     in `global.css` (the `html.dark .shiki span` rules).
 *   - The light theme does not leak inline `color` styles that
 *     would beat the CSS variables. `defaultColor: false` is
 *     what makes that possible — without it Shiki emits inline
 *     `color:` styles that win over the variables.
 *
 * Use this helper instead of calling `codeToHtml` directly so
 * the configuration lives in one place.
 */
const SHARED_OPTIONS = {
  themes: { light: 'github-light', dark: 'github-dark' },
  defaultColor: false,
} as const;

export async function highlightCode(code: string, lang: BundledLanguage = 'typescript') {
  return codeToHtml(code, { lang, ...SHARED_OPTIONS });
}
