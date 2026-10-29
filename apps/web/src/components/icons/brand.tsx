import type { SVGProps } from 'react';

/** The shared DeesseJS mark, using the same paths as the main site's header. */
export function DeessejsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 109 95" fill="none" aria-hidden {...props}>
      <g fill="currentColor" stroke="currentColor">
        <path d="M36.377 61.0078L16.877 94.5078H0.876953L28.377 48.0078L36.377 61.0078Z" />
        <path d="M43.877 94.0078H27.877L46.877 62.0078V61.0078L33.877 38.5078L41.377 25.0078L62.877 61.5078L43.877 94.0078Z" />
        <path d="M107.877 94.0078H54.877L62.877 80.0078H99.877L107.877 94.0078Z" />
        <path d="M94.877 71.0078H78.877L46.877 15.0078L54.877 1.00781L94.877 71.0078Z" />
      </g>
    </svg>
  );
}

/**
 * Brand icons that lucide-react does not ship.
 *
 * lucide-react intentionally avoids brand marks (GitHub, npm,
 * etc.) because its scope is general-purpose iconography. The
 * few brand icons this app needs live here so the rest of the
 * codebase imports a single, consistent surface.
 *
 * Each component accepts the same `SVGProps<SVGSVGElement>`
 * shape as a lucide icon, so callers can pass `className`,
 * `aria-hidden`, and friends without knowing the difference.
 */
export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656" />
    </svg>
  );
}
