-- 0002_lookup_tables.sql — small, independent lookup tables.
-- These three tables have no foreign-key dependencies and are referenced
-- everywhere else, so they go first.

CREATE TABLE bio.bio_accreditation (
    id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level  smallint NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 3)
);

CREATE TABLE bio.bio_iucn_category (
    id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code  char(2) NOT NULL UNIQUE CHECK (code IN ('LC','NT','VU','EN','CR','EW','EX'))
);

CREATE TABLE bio.bio_position (
    id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name   varchar(120) NOT NULL UNIQUE
);

-- Seed the lookup tables with the canonical values from the brief.
INSERT INTO bio.bio_accreditation (level) VALUES (1), (2), (3)
    ON CONFLICT (level) DO NOTHING;

INSERT INTO bio.bio_iucn_category (code) VALUES
    ('LC'), ('NT'), ('VU'), ('EN'), ('CR'), ('EW'), ('EX')
    ON CONFLICT (code) DO NOTHING;

INSERT INTO bio.bio_position (name) VALUES
    ('field_technician'),
    ('field_biologist'),
    ('scientific_coordinator')
    ON CONFLICT (name) DO NOTHING;

-- Position names are stable English canonicals; the frontend i18n layer
-- (frontend/src/i18n/en.json and es.json) translates them for display.
