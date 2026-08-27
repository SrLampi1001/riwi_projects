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
- **PR #79** (merged): database foundation. Migrations 0001–0009 (the `bio_*` schema, RLS, HNSW + keyset + partial unique indexes, `bio_visible_sighting` view, transactional `bio_register_sighting` + `bio_edit_or_annul_sighting` + `bio_search_investigators` (now a `RETURNS TABLE` function), and the `bio_mark_embedding_dirty` trigger). Medallion Bronze → Silver seed loader (`db/seed/seed.py`) with deterministic dev passwords (`Bio-{investigator_id}`) printed to stdout. Docker compose for `db` + `migrate` + `seed`, with every value sourced from env vars.
- **PR #80** (open → next): auth + actor propagation. FastAPI backend (`backend/`) with argon2id password hashing, HS256 short-lived JWT (15 min) carrying `sub = investigator_id`, 32-byte rotating refresh tokens with SHA-256 hashing, family-id reuse detection, single `bioma_app` connection pool, per-request `SET LOCAL app.current_user_id` via a `ConnectionProvider` port (so use cases depend on the port, not on the pool), RFC 9457 `application/problem+json` error envelopes, `X-Request-Id` middleware. Endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/me`, `GET /healthz`. Seed extended to upsert `bio_auth_credential`. Backend compose service with `BACKEND_PORT` env var. 16 tests passing (11 unit + 5 integration).

## 3. What's next (the implementation plan)

Following the brief's *ruta sugerida* (model-first, DB-second, backend third):

1. ~~**Database foundation**~~ — done (PR #79).
2. ~~**Auth + actor propagation**~~ — done (PR #80, ready to open).
3. **Use cases + REST API (read path)** — next. Clean Architecture extension, keyset-paginated `/api/v1/sightings` history endpoint, `ts_headline` search at `/api/v1/sightings/search?q=`, the visible-sighting view query, and `/api/v1/investigators?cursor` keyed on `bio_search_investigators`.
4. **Use cases + REST API (write path)** — register / edit / annul use cases calling the DB functions and procedures. Idempotent registration via `obs_ref`.
5. **RAG copilot** — Mistral embedding adapter, NVIDIA NIM chat adapter, prompt versioning, citations, denial taxonomy, consumption audit (`bio_copilot_usage`).
6. **Frontend** — React 19 + TS + Vite, three zones, i18n, lazy keyset, registration state machine.
7. **QA + deploy** — pytest-bdd against testcontainers, free-tier production topology, README run instructions.

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
