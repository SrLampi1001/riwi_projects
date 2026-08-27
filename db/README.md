# Database — Bioma

The schema is the **single security boundary** for the whole project. Visibility is enforced by PostgreSQL Row Level Security; the application role (`bioma_app`) has `NOBYPASSRLS` so the policy is the only gate.

This directory is intentionally split into two halves:

- `db/migrations/` — versioned SQL files. The `migrate` container applies them in numeric order, tracked in `bio.bio_schema_migrations`. **This is the single source of truth for the schema.**
- `db/policies/`, `db/functions/`, `db/procedures/`, `db/triggers/` — review-friendly comments and documentation. Bodies live inside the migrations.
- `db/seed/` — medallion load of `docs/seed.json` (Bronze → Silver). Embedding backfill is a separate script, run after the embeddings API is wired in the backend.

## Migration order

1. `0001_init.sql` — extensions (`pgcrypto`, `vector`), roles (`bioma_owner`, `bioma_app`), schema `bio`, `bio_schema_migrations`.
2. `0002_lookup_tables.sql` — `bio_accreditation`, `bio_iucn_category`, `bio_position` (with canonical English values).
3. `0003_bio_investigator.sql` — `bio_investigator`, `bio_auth_credential`, `bio_refresh_token`, `bio_copilot_usage`.
4. `0004_bio_species.sql` — `bio_species`.
5. `0005_bio_site.sql` — `bio_site`.
6. `0006_bio_sighting_and_field_note.sql` — `bio_sighting` (with `embedding vector(1024)` and `embedding_dirty_at`), `bio_field_note`.
7. `0007_indexes_views_policies.sql` — HNSW + composite + partial unique indexes; `bio_visible_sighting` view; RLS on `bio_sighting` and `bio_field_note`.
8. `0008_functions_procedures_triggers.sql` — `bio_register_sighting(...)`, `bio_search_investigators(...)`, `bio_edit_or_annul_sighting(...)`, the `bio_mark_embedding_dirty` trigger.
9. `0009_seed_workspace.sql` — `GRANT CREATE ON SCHEMA bio TO bioma_owner` so the seed role can provision the bronze staging table; creates `bio_stg_seed_sighting`.

## Roles

- `bioma_owner` (`BYPASSRLS`) — DDL, seed load, and the `migrate`/`seed` containers.
- `bioma_app` (`NOBYPASSRLS`) — the runtime role used by the backend. Every query is filtered by the RLS policy. Never used to load data or apply migrations.

## Hard rules in the schema

- **No physical DELETE** on `bio_*` tables. Annulment is logical only; the application role has the privilege stripped.
- **No SQL string concatenation** anywhere; every statement is parameterized. This is enforced by review, not by the database.
- **No `OFFSET`** in any query path; the keyset composite index `ix_bio_sighting_registered_at_id` backs cursor pagination.
- **Per-request actor** is set as `SET LOCAL app.current_user_id = <id from JWT>` inside the same transaction as the work.
- **Embeddings live in the same RLS-protected row** as the sighting. Similarity search cannot bypass the visibility rule.
