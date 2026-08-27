-- 0009_seed_workspace.sql — DDL for the seed role.
--
-- `bioma_owner` is the DDL/seed role per ARCHITECTURE.md §11. It needs
-- CREATE on the `bio` schema so the seed can create the bronze staging
-- table. The migration that creates `bio` schema runs as the postgres
-- superuser, which owns the schema by default; without the grants below,
-- bioma_owner cannot see or write anything inside it.
--
-- The bronze staging table itself lives here too — it is schema, not
-- application data, and the seed container relies on it being present.

GRANT USAGE, CREATE ON SCHEMA bio TO bioma_owner;

-- Full table-level access on every object already in the schema, plus the
-- same as default privileges for anything created in future migrations.
GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA bio TO bioma_owner;
GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA bio TO bioma_owner;
GRANT EXECUTE
    ON ALL FUNCTIONS IN SCHEMA bio TO bioma_owner;
GRANT EXECUTE
    ON ALL ROUTINES IN SCHEMA bio TO bioma_owner;

ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLES TO bioma_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT USAGE, SELECT ON SEQUENCES TO bioma_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT EXECUTE ON FUNCTIONS TO bioma_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT EXECUTE ON ROUTINES TO bioma_owner;

-- Bronze staging table.
CREATE TABLE IF NOT EXISTS bio.bio_stg_seed_sighting (
    obs_ref    varchar(64) PRIMARY KEY,
    payload    jsonb       NOT NULL,
    loaded_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE bio.bio_stg_seed_sighting IS
    'Bronze staging: raw seed payload, preserved as-received for re-runnable Silver loads.';