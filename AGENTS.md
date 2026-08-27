# AGENTS.md

This file is a pointer. **All agent-facing instructions for this project live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).**

Read `CONTRIBUTING.md` first, then `docs/ARCHITECTURE.md`, before any non-trivial change.

Highlights the agent must internalize:
- The canonical branch is **`project/web/assessment_test_final_simulacrum`** — treat it as `main`. Do not commit to `main` or `develop`.
- All work goes through a Pull Request; agents do not self-merge.
- AI-authored PRs must carry the `ai-assisted` label and the `[AI]` prefix in the title.
- The full architecture and non-negotiable rules (RLS, no `OFFSET`, no SQL concat, ports for AI providers) are in `docs/ARCHITECTURE.md`.
- Skills to load on demand are listed in `CONTRIBUTING.md` §5.