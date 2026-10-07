# AGENTS.md

This file provides guidance to AI coding agents (Claude, GitHub Copilot, Cursor, etc.) about working within this codebase.

## Project Purpose

This is a **TypeScript package template**. Use this as a starting point when creating new TypeScript packages.

### Working with this Template

There are two ways to work with this project:

1. **Developing the template itself**: You are working directly on this repository to improve or maintain it.

2. **Using the template for a new project**: You have cloned this template to start a new project. If you encounter a bug, have an idea for a new feature, or notice something that should be fixed in the template, **create an issue on the template repository** (https://github.com/nesalia-inc/complete-package-template/issues) so the template can be improved for everyone. Use the issue templates located in `.github/ISSUE_TEMPLATE/` when creating issues.

## Communication

- **Always communicate in English.** All explanations, comments, and documentation must be in English.

## Branching Strategy

This project follows the branching model: `main` <- `staging` <- `dev`

- **dev**: Latest work-in-progress changes. Developers work here.
- **staging**: Contains work that has been reviewed and is ready for release testing.
- **main**: Production-ready code. Contains the official release history.

All developers push directly to `main`. The release engineer is responsible for managing the flow from `main` to `staging` and from `staging` to `main` (releases).
