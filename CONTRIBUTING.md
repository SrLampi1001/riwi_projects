# Contributing — Bioma (project/web/assessment_test_final_simulacrum)

This document is the single source of truth for how to work on this project: branching, commits, PRs, AI-agent etiquette, coding conventions, and the skills the assistant should load when relevant. **`AGENTS.md` is a pointer to this file** — keep this one authoritative and update both.

---

## 1. Project identity & working branch

- **Project name:** Bioma (wildlife monitoring for Fundación Yarumo).
- **Architecture:** `docs/ARCHITECTURE.md` — read it before any non-trivial change.
- **Issue tracker / project tracking:** see top-level `project.yml` (this project participates in a multi-project monorepo).

### 1.1 The canonical branch is `project/web/assessment_test_final_simulacrum`

> Treat `project/web/assessment_test_final_simulacrum` as **`main` for this project.** Nothing else.

`main` and `develop` exist in this repository but they belong to a different (unrelated) project lineage managed via `git subtree`. The `.github/workflows/sync-to-develop.yml` workflow pulls changes from `project/web/assessment_test_final_simulacrum` into `develop`. **Do not commit to `main` or `develop` directly, ever.**

- **Base every branch off `project/web/assessment_test_final_simulacrum`** for any breaking change or new feature.
- Trivial fixes (typos in this `CONTRIBUTING.md`, README) can also branch from it for consistency.
- **PRs merge into `project/web/assessment_test_final_simulacrum`** — that is the canonical target. The workflow then syncs the result to `develop`.

If you find yourself on `main` or `develop`, stop — `git switch project/web/assessment_test_final_simulacrum` and start over from there.

---

## 2. Workflow: PR-first, no local-merge hacks

We switched to a PR-first workflow to keep the human in the loop on everything.

- **All changes go through a Pull Request**, including the work that AI agents produce. Direct local merges into `project/web/assessment_test_final_simulacrum` are not used anymore.
- Branch name format: `<type>/<short-kebab-summary>` (see §3).
- One PR = one commit, ideally (use `git commit --amend` or squash at merge time). Don't ship "drive-by" commits mixed into a feature PR.
- Before opening the PR: re-read your diff, run the project's checks (`docker compose config` at minimum; lint/typecheck/test once code lands), update `ARCHITECTURE.md` and this file if a design decision changed.
- **Do not merge your own PR.** Even the human owner reviews them; PRs are open for review.

### 2.1 AI-authored Pull Requests

The same GitHub account is used by the human and by AI agents (opencode / Cursor / etc.). To keep reviews honest, **every PR authored with substantial AI assistance must be visibly labelled as such.**

- **Add the label `ai-assisted` to the PR** when opening it (`gh pr create --label ai-assisted`). The PR template below reminds you; the assistant does this automatically.
- **Add the prefix `[AI]` to the PR title**, e.g. `[AI] Feat: Add pgvector migration`.
- In the PR description, include a one-line `Assisted-by:` note naming the tool and model (e.g. `Assisted-by: opencode / MiniMax-M3`). Keep it factual; don't pad.
- AI agents must never bypass the `ai-assisted` label — that would defeat the purpose. If a PR is mostly hand-written but used an autocomplete suggestion, the label is optional; use judgement.
- The reviewer is the final gate. AI PRs are reviewed by the human before merge, every time.

### 2.2 PR template (suggested body)

```markdown
## Summary
- <1–3 bullets describing the actual change>

## Why
- <link or short rationale; tie back to ARCHITECTURE.md if it touches a design decision>

## Checklist
- [ ] Reads cleanly
- [ ] Branches off `project/web/assessment_test_final_simulacrum`
- [ ] No secrets, no `BYPASSRLS`, no SQL string concat, no `OFFSET`
- [ ] `ARCHITECTURE.md` updated if a design decision changed
- [ ] Tests added/updated where it matters

## Assisted-by
- <tool / model, or "human-only">
```

---

## 3. Commits & branches

### 3.1 Commit message convention (match the existing log)

Repo style: `<Type>: <imperative summary>` in English, sentence-case after the colon, no trailing period.

| Type | Use for |
|---|---|
| `Feat` | New user-visible feature or capability |
| `Fix` | Bug fix |
| `Docs` | Documentation only |
| `Chore` | Tooling, dependencies, CI, no behavior change |
| `Refactor` | Internal restructure, no behavior change |
| `Test` | Adding or fixing tests only |
| `Revert` | Reverting a previous commit |

Examples from the existing log: `Feat: add docs/ folder and ADR record`, `Fix: assessment test renamed to simulacrum`.

### 3.2 Branch types

- `feat/<scope>-<short-summary>` — new capability
- `fix/<short-summary>` — bug
- `chore/<short-summary>` — tooling
- `docs/<short-summary>` — docs only
- `refactor/<short-summary>`
- `test/<short-summary>`

Avoid long branch names. Keep the scope noun-first (`auth/`, `db/`, `rag/`, `frontend/`) when the change is clearly one of those.

---

## 4. Coding conventions (high-level)

The full architectural rules live in `ARCHITECTURE.md`. The non-negotiables are repeated here so they're visible at PR-review time:

- **Database is the single security boundary.** Visibility is enforced by PostgreSQL Row Level Security, never in the application. Backend code does not reimplement the rule.
- **No physical deletes on `bio_*` tables** (revoked from the application role). Annulment is logical only.
- **No SQL by string concatenation.** Every query is parameterized. This is in the rubric and is an invalidating condition.
- **No `OFFSET` pagination.** Use keyset (cursor on `(registered_at, id)`). See `ARCHITECTURE.md` §6.
- **Per-request transaction** opens with `SET LOCAL app.current_user_id = <id from JWT>` before any read or write. This is the only place the actor is set.
- **AI provider ports are separate:** `EmbeddingProvider` (→ Mistral) and `ChatProvider` (→ NVIDIA NIM, OpenAI-compatible). Swap via configuration, not code. Never call a vendor SDK from a use case.
- **Versioned system prompt** for the copilot; field notes are untrusted and must be delimited inside the prompt.
- **RFC 9457 problem+json** for all errors; **`X-Request-Id`** correlation ID echoed everywhere; status codes follow `ARCHITECTURE.md` §6 (404 instead of 403 for hidden sightings).
- **i18n:** zero hardcoded strings in the frontend; everything in `es.json` / `en.json`.
- **Secrets:** `.env.example` ships placeholders only; real keys go in `.env` (gitignored). Never commit credentials, API keys, JWT signing keys, or DB URIs.

---

## 5. Skills the AI agent should load

The assistant (opencode / Cursor) should treat the following as **load-on-demand skills** — load them when the change touches that area. Keep this list short and project-specific; generic language skills aren't listed here.

| Skill | Load when the change touches… |
|---|---|
| `postgres-rd` | DDL, RLS, functions, procedures, triggers, indexes, pgvector |
| `pgvector-rd` | Embedding storage, similarity search, HNSW, vector indexes |
| `fastapi-rd` | Backend API, Pydantic v2, dependency injection, OpenAPI generation |
| `psycopg-rd` | psycopg 3 usage, async pools, transactions, server-side cursors |
| `jwt-auth-rd` | Argon2id hashing, short-lived access JWTs, refresh-token rotation |
| `rag-rd` | Retrieval pipeline, prompt assembly, citation format, denial taxonomy |
| `mistral-rd` | Calling Mistral's `mistral-embed` (1024 dims); batch embeddings to respect the free-tier RPS |
| `nvidia-nim-rd` | Calling NVIDIA NIM's OpenAI-compatible endpoint for chat (`meta/llama-3.3-70b-instruct` and alternates) |
| `react-ts-rd` | React 19 + TypeScript 5 + Vite 8 components, hooks, state machines |
| `react-leaflet-rd` | Map/list of sightings zone, marker/popup patterns |
| `react-i18next-rd` | ICU messages, `es.json`/`en.json`, lazy-load by namespace |
| `pytest-bdd-rd` | Gherkin scenarios, `testcontainers-python` PostgreSQL fixtures |
| `docker-compose-rd` | The five-service compose (db, migrate, seed, backend, frontend) |
| `free-tier-deploy-rd` | Neon / Render free-tier gotchas (pooled connections in transaction mode, cold start, PITR retention) |

When a skill doesn't exist in your tool's catalog yet, follow the principle documented here rather than guessing. Add new skills to this table, **and to your tool's installed skills**, with a one-line description and the trigger.

---

## 6. Reviews & merge

- **The human reviews every PR**, including AI-authored ones. AI agents do not self-approve.
- Merge method: **squash** by default, keeping the PR title (prefixed with `[AI]` when applicable) as the commit message on `project/web/assessment_test_final_simulacrum`.
- A merge automatically triggers `.github/workflows/sync-to-develop.yml`, which pulls the change into `develop`. Don't fight that workflow; let it run.
- For breaking architectural decisions, write a short entry in a separate `DECISIONS.md` (not yet created — file it the first time a real trade-off is made and link it from `ARCHITECTURE.md`).

---

## 7. Quick checklist (before you push)

- [ ] Branched off `project/web/assessment_test_final_simulacrum`.
- [ ] Commit message matches the convention.
- [ ] No secrets in the diff.
- [ ] No physical deletes, no SQL concat, no `OFFSET`.
- [ ] `ARCHITECTURE.md` updated if a design decision changed.
- [ ] PR opened with the right label and description; PR title `[AI]` prefix if AI-assisted.
- [ ] Did **not** merge the PR.