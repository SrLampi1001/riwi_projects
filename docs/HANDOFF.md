# Session Handoff — Bioma

This document is the **state snapshot** a fresh AI session reads at the start of work. It is intentionally short and operational. For full project context, see:

- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — the design.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — workflow and rules.
- [`AGENTS.md`](../AGENTS.md) — load-first summary for AI agents.

---

## 1. Where the project is right now

- Architecture and tech stack are **locked**. See `docs/ARCHITECTURE.md`.
- Repository conventions, branch policy, PR workflow, and AI-marking rules are **locked**. See `CONTRIBUTING.md`.
- Canonical branch: `project/web/assessment_test_final_simulacrum`. Treat as `main`.
- All branches targeting this project must start with `assessment_test_final_simulacrum/<type>/`.
- No direct merges into the canonical branch — PR-first, human reviews.
- Inside a feature branch, commits are free. PRs open at big feature/functionality milestones.
- Everything in English. The only Spanish in the repo is `docs/proyecto-integrador-bioma.md` (the assignment brief) and `docs/seed.json` (raw corpus); do not "fix" them.

## 2. What has been done (do not redo)

- **PR #78** (merged): added `CONTRIBUTING.md`, `AGENTS.md`, rewrote `README.md` with the canonical-branch clone instruction. Branch-naming convention (`assessment_test_final_simulacrum/<type>/`) is now the rule.
- **Architecture** (`docs/ARCHITECTURE.md`): final, with 3FN domain model, RLS design, RAG pipeline, Clean Architecture + pragmatic CQRS, API contract, medallion ETL, BDD QA, free-tier production topology, and the tech-stack table (Mistral `mistral-embed` for embeddings, NVIDIA NIM `meta/llama-3.3-70b-instruct` for chat, behind separate ports).

## 3. What's next (the implementation plan)

Following the brief's *ruta sugerida* (model-first, DB-second, backend third):

1. **Database foundation** — first PR. DDL, RLS, functions/procedures/triggers, medallion seed, docker compose for `db` + `migrate` + `seed`.
2. **Auth + actor propagation** — second PR. Argon2id hashing, short-lived JWT, refresh-token rotation, `app.current_user_id` middleware, psycopg 3 adapter wiring.
3. **Use cases + REST API (read path)** — third PR. Clean Architecture skeleton, keyset-paginated history endpoint, `ts_headline` search endpoint, the visible-sighting view query.
4. **Use cases + REST API (write path)** — fourth PR. Register / edit / annul use cases calling the DB functions and procedures. Idempotent registration via `obs_ref`.
5. **RAG copilot** — fifth PR. Mistral embedding adapter, NVIDIA NIM chat adapter, prompt versioning, citations, denial taxonomy, consumption audit (`bio_copilot_usage`).
6. **Frontend** — sixth PR. React 19 + TS + Vite, three zones, i18n, lazy keyset, registration state machine.
7. **QA + deploy** — seventh PR. pytest-bdd against testcontainers, free-tier production topology, README run instructions.

Steps 1–5 are backend + data; 6 is frontend; 7 is closure. The order matters: each step builds on what is already merged into the canonical branch.

## 4. Operating rules (carry these into every session)

- **Database is the single security boundary.** Visibility is enforced by PostgreSQL Row Level Security, never in the application. Backend code does not reimplement the rule.
- **No physical deletes on `bio_*` tables.** Annulment is logical only.
- **No SQL string concatenation.** Every query is parameterized.
- **No `OFFSET` pagination.** Use keyset on `(registered_at, id)`.
- **Per-request transaction** opens with `SET LOCAL app.current_user_id = <id from JWT>` before any read or write. The actor is set in exactly one place.
- **AI provider ports are separate** — `EmbeddingProvider` (→ Mistral) and `ChatProvider` (→ NVIDIA NIM, OpenAI-compatible). Swap via configuration, never from use cases.
- **Versioned system prompt** for the copilot. Field notes are untrusted data and must be delimited.
- **RFC 9457 problem+json** for all errors; **`X-Request-Id`** echoed everywhere.
- **i18n:** zero hardcoded strings in the frontend; everything in `es.json` / `en.json`.
- **Secrets:** `.env.example` ships placeholders only; real keys go in `.env` (gitignored).

## 5. Skills to load on demand

See `CONTRIBUTING.md` §5 for the full table. The ones most relevant to early work:

- `postgres-rd`, `pgvector-rd` (always, for DB work)
- `psycopg-rd` (when wiring the backend)
- `fastapi-rd` (when wiring the API)
- `pytest-bdd-rd` (when adding tests)
- `docker-compose-rd` (when running the local stack)
- `mistral-rd`, `nvidia-nim-rd`, `rag-rd` (when wiring the copilot)
- `jwt-auth-rd` (when wiring auth)

## 6. Conventions for AI agents on this repo

- Read `AGENTS.md` first, then `CONTRIBUTING.md` §1–4 and `ARCHITECTURE.md` §2–3 before writing any code.
- Branch from canonical, commit freely inside the branch, open a PR when the slice is reviewable.
- Mark AI-authored PRs with the `ai-assisted` label, the `[AI]` title prefix, and an `Assisted-by:` line.
- Never merge a PR. The human owner reviews and merges.
- Never push secrets or `.env` files.

## 7. Useful commands

```bash
# clone (canonical branch only)
git clone -b project/web/assessment_test_final_simulacrum --single-branch https://github.com/SrLampi1001/riwi_projects.git

# start a feature branch from canonical
git switch project/web/assessment_test_final_simulacrum
git switch -c assessment_test_final_simulacrum/feat/<scope>-<summary>

# open a PR (label + AI prefix in title)
gh pr create \
  --base project/web/assessment_test_final_simulacrum \
  --head assessment_test_final_simulacrum/feat/<scope>-<summary> \
  --label ai-assisted \
  --title "[AI] Feat: <scope> <summary>" \
  --body-file <path-to-temp-body.md>
```

PowerShell users: write PR bodies to a temp file (e.g. `C:\Users\<you>\AppData\Local\Temp\opencode\pr-body.md`) and pass it via `--body-file`. Inline `--body` mangles backticks and bullets under PowerShell escaping rules. See `CONTRIBUTING.md` §2.2.
