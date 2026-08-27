# Bioma

Wildlife monitoring platform for the Fundación Yarumo — sightings, researchers, accreditation-based visibility, and an AI copilot with citations.

> **Canonical branch for this project:** `project/web/assessment_test_final_simulacrum`. Treat it as `main`. `main` and `develop` exist in the repository but belong to a separate, unrelated project.

## Where to start

- **Architecture:** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — read first.
- **Working agreements:** [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branches, PR rules, conventions.
- **Quick rules for AI assistants:** [`AGENTS.md`](./AGENTS.md) — pointer summary.
- **Assignment brief (in Spanish):** [`docs/proyecto-integrador-bioma.md`](./docs/proyecto-integrador-bioma.md).

## Get the code

Clone the canonical branch only — `--single-branch` keeps the working tree free of the unrelated `main` / `develop` lineage:

```bash
git clone -b project/web/assessment_test_final_simulacrum --single-branch https://github.com/SrLampi1001/riwi_projects.git
```

After cloning, all new branches targeting this project must start with `assessment_test_final_simulacrum/<type>/` (see `CONTRIBUTING.md` §3.2).

## Status

Architecture and tech stack are locked. Implementation is in progress; check open PRs for the current state.

**Current slice (PR in progress):** database foundation — DDL, RLS, transactional function/procedures, embedding-dirty trigger, medallion seed (Bronze → Silver), docker compose for `db` + `migrate` + `seed`. Run instructions live in [`db/README.md`](./db/README.md) and [`db/seed/README.md`](./db/seed/README.md).

## Stack at a glance

Python 3.13 · FastAPI · PostgreSQL 18 + pgvector · psycopg 3 · React 19 + TypeScript + Vite 8 · Leaflet + OSM · react-i18next · pytest + pytest-bdd + testcontainers · Docker Compose.

AI: **Mistral `mistral-embed`** (1024-dim embeddings) and **NVIDIA NIM** (`meta/llama-3.3-70b-instruct`, OpenAI-compatible chat). Both behind separate ports — never called directly from use cases.