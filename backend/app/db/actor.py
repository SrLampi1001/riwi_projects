"""Actor-aware connection helpers.

Every authenticated request must run its queries under a transaction that
opens with ``SET LOCAL app.current_user_id = <id>`` so PostgreSQL Row Level
Security can resolve the actor (see ``db/migrations/0007``). Login and
refresh token endpoints have no actor yet, so they use ``no_actor_connection``.

Both helpers ``yield`` an active ``AsyncConnection`` that has an open
transaction. They ``commit`` on clean exit and ``rollback`` on exception.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from app.db.pool import pool as get_live_pool

ActorConnection = AsyncConnection
NoActorConnection = AsyncConnection


@asynccontextmanager
async def _transaction(conn: AsyncConnection) -> AsyncIterator[AsyncConnection]:
    """Wrap a connection in a transaction; commit/rollback on exit."""

    try:
        async with conn.transaction():
            yield conn
    except Exception:
        # psycopg rolls back on exception propagation from `transaction()`.
        raise


@asynccontextmanager
async def actor_connection(actor_id: int) -> AsyncIterator[ActorConnection]:
    """Acquire a connection, open a transaction, set the actor, yield.

    The ``SET LOCAL`` only applies inside the transaction; once the
    transaction ends, the setting is released automatically by PostgreSQL.
    """

    p: AsyncConnectionPool = get_live_pool()
    async with p.connection() as conn:
        async with _transaction(conn):
            # Parameterised: psycopg passes the value as a server-side literal.
            await conn.execute(
                "SELECT set_config('app.current_user_id', %s, true)",
                (str(actor_id),),
            )
            yield conn


@asynccontextmanager
async def no_actor_connection() -> AsyncIterator[NoActorConnection]:
    """Acquire a connection with an open transaction, without an actor.

    Used by login + refresh, which must read auth tables before the actor
    is known. RLS on ``bio_sighting`` and ``bio_field_note`` correctly
    returns zero rows under no actor; auth tables have no RLS so they are
    readable.
    """

    p: AsyncConnectionPool = get_live_pool()
    async with p.connection() as conn:
        async with _transaction(conn):
            yield conn