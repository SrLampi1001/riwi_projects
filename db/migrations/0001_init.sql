-- 0001_init.sql — extensions, roles, schema, migrations table.
-- This is the first migration to apply. It creates the database-wide foundation:
-- extensions (pgcrypto for gen_random_uuid, vector for embeddings), the two
-- application roles (bioma_owner = DDL/seed with BYPASSRLS, bioma_app = runtime
-- without BYPASSRLS so Row Level Security is always enforced), and the
-- bio_schema_migrations bookkeeping table used by the migrate container.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS bio;

-- Roles are created with LOGIN. The connection passwords match the ones in
-- docker-compose.yml; they are placeholders for local development. In a
-- managed service (Neon/Supabase) create these roles via a one-off migration
-- and rotate the passwords through secrets.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bioma_owner') THEN
        CREATE ROLE bioma_owner LOGIN BYPASSRLS PASSWORD 'change_me_owner';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bioma_app') THEN
        CREATE ROLE bioma_app LOGIN NOBYPASSRLS PASSWORD 'change_me_app';
    END IF;
END
$$;

-- Allow bioma_owner and bioma_app to connect to the database, and let
-- bioma_owner own the schema so DEFAULT PRIVILEGES apply cleanly.
GRANT CONNECT ON DATABASE bioma_local TO bioma_owner;
GRANT CONNECT ON DATABASE bioma_local TO bioma_app;

GRANT USAGE ON SCHEMA bio TO bioma_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT SELECT, INSERT, UPDATE ON TABLES TO bioma_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT USAGE, SELECT ON SEQUENCES TO bioma_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT EXECUTE ON FUNCTIONS TO bioma_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA bio
    GRANT EXECUTE ON ROUTINES TO bioma_app;

CREATE TABLE IF NOT EXISTS bio.bio_schema_migrations (
    version     text        PRIMARY KEY,
    applied_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON SCHEMA bio IS
    'All application tables live here. Prefixed bio_; naming convention enforced by review.';
