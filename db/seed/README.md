# Seed — Medallion Bronze → Silver

Loads `docs/seed.json` (the desnormalized corpus) into the project database using a two-layer medallion approach:

1. **Bronze — `stg_seed_sighting(payload jsonb)`** — raw corpus, as received. Imported verbatim from the JSON file. The row identity is the original `obs_ref`.
2. **Silver — `bio_*` normalized 3FN tables** — populated from the bronze payload. Idempotent: re-running the script does not duplicate rows.

This PR's seed leaves `bio_sighting.embedding` and `bio_sighting.embedding_dirty_at` NULL for now. The dirty-marker trigger fires on each new `bio_field_note` and a backend worker will fill the embeddings once Mistral is wired in.

## Inputs

- `SEED_JSON_PATH` (default `../../docs/seed.json`) — the source corpus file.
- `DATABASE_URL` (default `postgresql://bioma_owner:change_me_owner@db:5432/bioma_local`) — connects as `bioma_owner`, which has `BYPASSRLS` for the load.

## How to run

```bash
# from the project root, with docker compose up db running:
docker compose run --rm seed
```

Or directly:

```bash
pip install -r ops/seed/requirements.txt
python db/seed/seed.py
```

## Idempotency

- Bronze: `INSERT ... ON CONFLICT (obs_ref) DO NOTHING`.
- Silver: every upsert uses `ON CONFLICT` on natural keys (email, scientific name, (name, region), `(investigator_id, obs_ref)`).

Re-running the seed is safe and leaves the database in the same state.

## Future work

- `db/seed/backfill_embeddings.py` — script to populate `bio_sighting.embedding` for all dirty rows by calling Mistral in batches (≤ 50 inputs per request to respect the free-tier RPS). Not in this PR; will land when the embedding adapter is wired in the backend.
