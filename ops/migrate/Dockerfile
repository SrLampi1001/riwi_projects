# Apply migrations. Runs once, then exits.
# Slim Debian base; only the postgres client is needed (psql from postgresql-client).
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /db
COPY db/migrations /db/migrations

COPY ops/migrate/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV MIGRATIONS_DIR=/db/migrations

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]


