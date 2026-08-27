# Procedures

Procedure bodies live in [`db/migrations/0008_functions_procedures_triggers.sql`](../migrations/0008_functions_procedures_triggers.sql). This directory is for review commentary.

| Procedure | Purpose | Security |
|---|---|---|
| `bio_search_investigators(after_name, after_id, limit)` | Researcher lookup with keyset pagination. | `SECURITY INVOKER` (caller is constrained by RLS). |
| `bio_edit_or_annul_sighting(sighting_id, actor_id, annul, note_body, annul_reason)` | Edit appends a new field-note version; annul sets `annulled_at` + reason. Rejects non-owners. | `SECURITY DEFINER` (so the `WITH CHECK` on the policy does not block the mutation the procedure is authorised to perform). |
