# Bioma Backend

FastAPI service for the Bioma wildlife-monitoring platform. Implements:

- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` (argon2id + JWT + rotating refresh tokens with family revocation).
- Actor propagation: every authenticated request opens a transaction as `bioma_app` and runs `SET LOCAL app.current_user_id = <id from JWT>` before any read or write. PostgreSQL Row Level Security is the audit boundary.
- Self endpoint: `GET /api/v1/me` (requires auth).
- Healthcheck: `GET /healthz` (no auth).

The full endpoint surface (history, register, search, copilot, usage) is added in subsequent PRs — see `docs/HANDOFF.md` §3.

## Architecture

Clean Architecture, no ORM (psycopg 3 raw SQL):

```
backend/app/
├── domain/        # pure, no deps: ports + value types
├── usecases/      # thin validation + dispatch
├── adapters/      # implementations of ports (Postgres, argon2, JWT, ...)
├── delivery/      # FastAPI routers + dependencies
├── db/            # connection pool, actor helper
├── observability/ # request-id middleware, logging
├── config.py      # pydantic-settings, reads env
└── main.py        # FastAPI factory
```

Single `bioma_app` connection pool. Login and refresh use `no_actor_connection()`; authenticated routes use `actor_connection(actor_id)`.

## Environment

Reads from `.env` at the project root (docker-compose mounts it; the
local Python interpreter needs `python-dotenv` or explicit sourcing).
Required env vars (see `.env.example`):

- `DATABASE_URL` — points at `bioma_app` (NOBYPASSRLS).
- `JWT_SECRET` — HS256 signing key.
- `JWT_ACCESS_TTL_SECONDS` (default 900).
- `JWT_REFRESH_TTL_SECONDS` (default 2592000).
- `APP_ENV`, `LOG_LEVEL`.

## Local run

```bash
docker compose up -d db migrate seed   # boot stack + load corpus
docker compose up -d backend            # start API
curl -X POST http://localhost:8000/api/v1/auth/login \
     -H 'content-type: application/json' \
     -d '{"email":"camila.andrade@yarumo.org","password":"Bio-1"}'
```

## Tests

```bash
docker compose up -d db migrate seed
PYTHONPATH=backend pytest -q backend/tests
```