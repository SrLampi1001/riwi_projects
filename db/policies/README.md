# Policies

Row Level Security lives in [`db/migrations/0007_indexes_views_policies.sql`](../migrations/0007_indexes_views_policies.sql). This directory is for review-friendly commentary and for any future policies that need their own file (e.g. row-level controls on `bio_field_note` if they grow beyond a one-liner).

## Current policies

| Table | Policy | Effect |
|---|---|---|
| `bio_sighting` | `bio_sighting_visibility` | Allow rows where `classification <= actor accreditation` OR `author = actor`, AND `annulled_at IS NULL`. |
| `bio_field_note` | `bio_field_note_visibility` | Allow only notes whose parent sighting is visible. |

Both policies target `bioma_app` (the runtime role, `NOBYPASSRLS`).
