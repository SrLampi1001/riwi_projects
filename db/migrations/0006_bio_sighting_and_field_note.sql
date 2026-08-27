-- 0006_bio_sighting_and_field_note.sql — the aggregate root and its notes.
--
-- Notes are versioned: science never deletes evidence; each edit creates a
-- new bio_field_note row. Embedding is recomputed by the trigger defined in
-- 0008_functions_procedures_triggers.sql; it stays in the same row so RLS
-- filters similarity search by the same policy as direct visibility.
--
-- Logical annulment only — `annulled_at` + `annulment_reason` appear together
-- (CHECK constraint). A direct DELETE on this table is revoked from
-- bioma_app; only the bio_edit_or_annul_sighting procedure can flip the flag.

CREATE TABLE bio.bio_sighting (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    obs_ref            varchar(64) NOT NULL UNIQUE,
    investigator_id    bigint NOT NULL REFERENCES bio.bio_investigator(id) ON DELETE RESTRICT,
    species_id         bigint NOT NULL REFERENCES bio.bio_species(id) ON DELETE RESTRICT,
    site_id            bigint NOT NULL REFERENCES bio.bio_site(id) ON DELETE RESTRICT,
    classification     smallint NOT NULL CHECK (classification BETWEEN 1 AND 3),
    at_latitude        numeric(9,6) NOT NULL CHECK (at_latitude BETWEEN -90 AND 90),
    at_longitude       numeric(9,6) NOT NULL CHECK (at_longitude BETWEEN -180 AND 180),
    registered_at      timestamptz NOT NULL DEFAULT now(),
    edited_at          timestamptz,
    annulled_at        timestamptz,
    annulment_reason   text,
    embedding          vector(1024),
    embedding_dirty_at timestamptz,
    CHECK (
        (annulled_at IS NULL AND annulment_reason IS NULL)
        OR (annulled_at IS NOT NULL AND annulment_reason IS NOT NULL)
    )
);

CREATE TABLE bio.bio_field_note (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sighting_id  bigint NOT NULL REFERENCES bio.bio_sighting(id) ON DELETE CASCADE,
    version      integer NOT NULL CHECK (version >= 1),
    body         text NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (sighting_id, version)
);

CREATE INDEX ix_bio_field_note_sighting
    ON bio.bio_field_note (sighting_id, version DESC);
