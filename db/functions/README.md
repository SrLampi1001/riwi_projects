# Functions

Function bodies live in [`db/migrations/0008_functions_procedures_triggers.sql`](../migrations/0008_functions_procedures_triggers.sql). This directory is for review commentary.

| Function | Purpose | Security |
|---|---|---|
| `bio_iucn_to_classification(code)` | Map an IUCN code to the default classification (1/2/3). | `SECURITY INVOKER`, `IMMUTABLE`. |
| `bio_register_sighting(...)` | Insert a sighting and its first note version in one transaction. Returns the new sighting id. | `SECURITY DEFINER` (bypasses the `WITH CHECK` clause on insert so the actor's own id is preserved). |
| `bio_mark_embedding_dirty()` | Trigger function: marks a sighting as dirty when a new field note arrives. | `SECURITY INVOKER`. |
