# Triggers

Trigger bodies live in [`db/migrations/0008_functions_procedures_triggers.sql`](../migrations/0008_functions_procedures_triggers.sql). This directory is for review commentary.

| Trigger | Fires | Effect |
|---|---|---|
| `trg_field_note_mark_dirty` | `AFTER INSERT ON bio_field_note` | Sets `bio_sighting.embedding_dirty_at = now()` so the embedding worker can recompute the vector. |

The embedding itself is **not** computed inside the database: PostgreSQL has no HTTP client and the project's image does not bundle PL/Python. Instead the worker (added in a later PR, behind the `EmbeddingProvider` port) drains `bio_sighting WHERE embedding_dirty_at IS NOT NULL AND embedding IS NULL`, calls Mistral `mistral-embed`, and writes the vector back. RLS still applies to the worker because it runs as `bioma_app` with `app.current_user_id` set.
