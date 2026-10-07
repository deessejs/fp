---
"@deessejs/fp": patch
---

chore: rename agent guidance file from CLAUDE.md to AGENTS.md

Moves the project instructions from `CLAUDE.md` to `AGENTS.md` and reduces `CLAUDE.md` to a single line containing `@AGENTS.md`, so that any tool that follows the `@<otherfile>` convention (Claude Code, Cursor, GitHub Copilot) will resolve the redirect to the canonical `AGENTS.md`.

Why:

- `AGENTS.md` is the cross-vendor convention for AI-agent guidance (Claude Code, Cursor, GitHub Copilot, Aider, Zed, etc.) — a single file that all of them read.
- The old `CLAUDE.md` was Claude-specific. The new naming makes the project vendor-neutral without losing Claude compatibility (Claude Code also reads `AGENTS.md`).
- The `@AGENTS.md` redirect keeps backward compatibility for any tool that still looks for `CLAUDE.md` and supports the redirect convention.

Also updates 9 references to `CLAUDE.md` in the repo:

- `README.md` and `packages/fp/README.md` (project tree comments)
- `docs/engineering/plans/release-pipeline.md` (3 prose references)
- `docs/engineering/process/changesets.md` (cross-link)
- `.claude/agent-memory/design-engineer/{project_architecture,user_role}.md` (memory notes)
- `.claude/agents/release-engineer/README.md` (agent instructions)

No public API change. The published `@deessejs/fp` artifact is unaffected — `AGENTS.md` and `CLAUDE.md` are not in the package's `files` allow-list, so neither ships to npm.
