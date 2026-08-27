#!/usr/bin/env bash
# Applies db/migrations/*.sql in numeric order. Each migration is recorded in
# bio.bio_schema_migrations so re-runs are no-ops. Run as bioma_owner.

set -euo pipefail

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/db/migrations}"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

# Wait for the database to accept connections.
for i in {1..60}; do
    if psql "$DATABASE_URL" -c 'SELECT 1' >/dev/null 2>&1; then
        break
    fi
    echo "waiting for database ($i)..."
    sleep 2
done

# Make sure the schema + migrations bookkeeping table exist before we
# query them. 0001_init.sql also creates the schema and the table; this
# pre-step is only for the very first run before any migration has been
# applied (the schema does not yet exist, so the bookkeeping table
# cannot be created without first creating the schema).
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE SCHEMA IF NOT EXISTS bio;
CREATE TABLE IF NOT EXISTS bio.bio_schema_migrations (
    version    text        PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

# Apply any migration whose filename is not yet in bio_schema_migrations, in order.
applied=$(psql "$DATABASE_URL" -tA -c "SELECT version FROM bio.bio_schema_migrations;")
shopt -s nullglob
for file in "$MIGRATIONS_DIR"/*.sql; do
    version=$(basename "$file" .sql)
    if printf '%s\n' "$applied" | grep -Fxq "$version"; then
        echo "skip   $version"
        continue
    fi
    echo "apply  $version"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$file"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "INSERT INTO bio.bio_schema_migrations (version) VALUES ('$version');"
done
shopt -u nullglob

echo "migrations complete."
