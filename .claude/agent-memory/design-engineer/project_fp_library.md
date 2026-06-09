---
name: project_fp_library
description: @deessejs/fp is a TypeScript FP library with 3 main types: Result, Maybe, Unit
type: project
---

## Project Overview

This is a **TypeScript monorepo** containing a functional programming library (`@deessejs/fp`) and its documentation website.

## Package: @deessejs/fp

A functional programming utility library with three main types:

| Type | Purpose | States |
|------|---------|--------|
| `Result<T, E>` | Type-safe error handling | `Ok` \| `Err` |
| `Maybe<T>` | Optional values | `Some` \| `None` |
| `Unit` | Intentional void for side effects | Single value |

## Documentation Site (Design Focus)

- **Location:** `apps/web/`
- **Docs:** `apps/web/content/docs/`
- **Format:** MDX with custom components
- **Components:** `<Cards>`, `<Card>`, `<Callout>`, `<Tabs>`, `<Tab>`
- **Navigation:** Configured in `meta.json`

## Documentation Structure

```
index → getting-started → result → maybe → unit → [separator] → api-reference
```

## Docs Files

- `index.mdx` — Landing page
- `getting-started.mdx` — Quick start guide
- `result.mdx` — Result type docs (272 lines)
- `maybe.mdx` — Maybe type docs (295 lines)
- `unit.mdx` — Unit type docs (90 lines)
- `api-reference.mdx` — Complete API reference
- `meta.json` — Navigation configuration

## Documentation Style

- Frontmatter: `title`, `description`
- Code examples with `filename="..."` annotations
- Sections per type: constructors → transformations → pattern matching → unwrapping → type guards → conversions

## Design Reference (from @deessejs/errors)

The errors documentation site demonstrates the target design patterns:

### Visual Design
- **Background:** Blueprint grid aesthetic with floating SVG elements
- **Typography:** Bold, tight tracking headings (text-5xl/6xl)
- **Color:** `fd-` prefixed palette (foreground, muted, primary, etc.)
- **Borders:** `border-fd-border`, `rounded-none` (sharp corners)
- **Cards:** `bg-fd-card`, `border border-fd-border`, hover states with `hover:border-fd-accent`

### Key Components
- `CodeBlock` — Syntax highlighting with Shiki, optional title bar with macOS dots
- `CtaCard` — CTA section with copy-to-clipboard install command
- `Footer` — Multi-column link grid with brand section

### Page Layout
- Max width container: `max-w-6xl mx-auto px-6`
- Hero sections with large typography + code examples
- Feature cards in responsive grid (lg:grid-cols-6)
- Before/After code comparisons side-by-side

### Navigation
- Primary nav links with underline hover states
- Smooth scroll behavior
- Feature cards link to doc sections