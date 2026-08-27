-- 0007_indexes_views_policies.sql — supporting indexes, the visible-sighting
-- view required by brief §3, and Row Level Security on bio_sighting.
--
-- The visibility rule is:
--   classification <= actor.accreditation  OR  sighting.author = actor
-- with annulled sightings always hidden.

-- Vector index (HNSW) for similarity search; partial so annulled rows are not indexed.
CREATE INDEX ix_bio_sighting_embedding_hnsw
    ON bio.bio_sighting
    USING hnsw (embedding vector_cosine_ops)
    WHERE annulled_at IS NULL;

-- Composite index backing keyset pagination on (registered_at DESC, id DESC).
CREATE INDEX ix_bio_sighting_registered_at_id
    ON bio.bio_sighting (registered_at DESC, id DESC);

-- Required partial unique index: same investigator + species + site on the same
-- UTC day, while the record is active.
CREATE UNIQUE INDEX uq_bio_sighting_active_daily
    ON bio.bio_sighting (
        investigator_id,
        species_id,
        site_id,
        ((registered_at AT TIME ZONE 'UTC')::date)
    )
    WHERE annulled_at IS NULL;

-- Lookup helpers for filters used by the brief's required queries.
CREATE INDEX ix_bio_sighting_species ON bio.bio_sighting (species_id) WHERE annulled_at IS NULL;
CREATE INDEX ix_bio_sighting_site    ON bio.bio_sighting (site_id)    WHERE annulled_at IS NULL;
CREATE INDEX ix_bio_sighting_author  ON bio.bio_sighting (investigator_id) WHERE annulled_at IS NULL;

-- View: bio_visible_sighting is the read-side facade that encapsulates both
-- the logical-annulment filter and (where used) the RLS policy. The brief
-- explicitly requires this view.
CREATE VIEW bio.bio_visible_sighting AS
    SELECT *
      FROM bio.bio_sighting
     WHERE annulled_at IS NULL;

COMMENT ON VIEW bio.bio_visible_sighting IS
    'Sighting rows that are not logically annulled. RLS still applies; '
    'bioma_app sees only those it is accredited for (or its own).';

-- Row Level Security on bio_sighting. The application role (bioma_app) has
-- NOBYPASSRLS so this policy is the single audit boundary.
ALTER TABLE bio.bio_sighting ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio.bio_sighting FORCE ROW LEVEL SECURITY;

-- Helper: current_setting('app.current_user_id', true) returns NULL if missing
-- or empty (the `true` arg swallows the error). NULL actor => no rows visible.
CREATE POLICY bio_sighting_visibility ON bio.bio_sighting
    FOR ALL
    TO bioma_app
    USING (
        annulled_at IS NULL
        AND (
            classification <= (
                SELECT a.level
                  FROM bio.bio_investigator i
                  JOIN bio.bio_accreditation a ON a.id = i.accreditation_id
                 WHERE i.id = NULLIF(current_setting('app.current_user_id', true), '')::bigint
            )
            OR investigator_id = NULLIF(current_setting('app.current_user_id', true), '')::bigint
        )
    )
    WITH CHECK (
        -- Writes are rejected unless the actor is the author. The transaction
        -- function bio_register_sighting is SECURITY DEFINER and bypasses this
        -- check on INSERT; subsequent edits/annuls go through the procedure.
        investigator_id = NULLIF(current_setting('app.current_user_id', true), '')::bigint
    );

-- The bio_visible_sighting view inherits RLS from bio_sighting.
-- Auxiliary tables also get policies so the application cannot bypass them
-- by querying through views.
ALTER TABLE bio.bio_field_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio.bio_field_note FORCE ROW LEVEL SECURITY;
CREATE POLICY bio_field_note_visibility ON bio.bio_field_note
    FOR ALL TO bioma_app
    USING (
        sighting_id IN (
            SELECT id FROM bio.bio_visible_sighting
        )
    )
    WITH CHECK (
        sighting_id IN (
            SELECT id FROM bio.bio_visible_sighting
        )
    );

-- Read-only access for bioma_app on lookup tables (positions, accreditations,
-- IUCN categories, sites, species, investigators, copilot_usage scope-limited).
GRANT SELECT ON bio.bio_accreditation TO bioma_app;
GRANT SELECT ON bio.bio_iucn_category TO bioma_app;
GRANT SELECT ON bio.bio_position      TO bioma_app;
GRANT SELECT ON bio.bio_site          TO bioma_app;
GRANT SELECT ON bio.bio_species       TO bioma_app;
GRANT SELECT ON bio.bio_investigator  TO bioma_app;
GRANT SELECT ON bio.bio_copilot_usage TO bioma_app;
GRANT SELECT, INSERT ON bio.bio_copilot_usage TO bioma_app;
