# AGENTS.md

This is a short, load-first summary for both humans and AI assistants operating on this repository.

> **For the complete rules, read [`CONTRIBUTING.md`](./CONTRIBUTING.md).**
> **For the architecture, read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).**

This file is intentionally short. If something here disagrees with `CONTRIBUTING.md`, the contributor guide wins.

## Apply to humans and AI assistants alike

All rules below apply to both — there is no "humans-only" or "agents-only" carve-out. AI assistants must follow the same conventions as humans, plus the additional marking norm.

## Rules to internalize before doing anything

- **Canonical branch:** `project/web/assessment_test_final_simulacrum`. Treat it as `main`. Do not commit to `main` or `develop` — they belong to an unrelated project lineage managed via `git subtree`.
- **Branch prefix:** every branch targeting this project must start with `assessment_test_final_simulacrum/<type>/` (e.g. `assessment_test_final_simulacrum/feat/db-pgvector-migration`).
- **PR-first, no self-merge:** every change goes through a Pull Request into `project/web/assessment_test_final_simulacrum`. No one self-merges.
- **AI marking is mandatory:** any PR with substantial AI assistance carries the `ai-assisted` label and the `[AI]` prefix in the title. Include a one-line `Assisted-by:` note in the body. This is the single AI-specific norm — humans and agents share every other rule.
- **Architecture is the source of truth:** non-negotiables (RLS, no `OFFSET`, no SQL string concatenation, separate `EmbeddingProvider` / `ChatProvider` ports) live in `ARCHITECTURE.md` and are repeated in `CONTRIBUTING.md` §4.
- **Skills are load-on-demand:** see `CONTRIBUTING.md` §5 for the project-specific skill keys (postgres-rd, pgvector-rd, fastapi-rd, mistral-rd, nvidia-nim-rd, etc.).