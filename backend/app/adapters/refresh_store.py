"""Postgres-backed refresh token store.

Tokens are 32-byte URL-safe random strings; the store only ever sees the
SHA-256 hash. Argon2 is unnecessary here — the input is already a
high-entropy random secret, so a fast deterministic hash gives indexed
lookup with no loss of security.

Rotation contract:
    * ``create`` opens a fresh chain (new ``family_id``).
    * ``find_by_hash`` returns the stored record regardless of revocation.
    * ``revoke`` marks a single token as revoked (called on rotation).
    * ``revoke_family`` marks every active member of a chain as revoked
      (called when a revoked token is presented; the whole chain is
      treated as compromised).

All methods take the open ``AsyncConnection`` from the caller — the use
case opens the transaction and owns its lifetime.
"""

from __future__ import annotations

import datetime as dt
from typing import Optional

from psycopg import AsyncConnection

from app.domain.ports import RefreshTokenStore, StoredRefreshToken


class PostgresRefreshTokenStore:
    """psycopg 3 adapter for ``bio_refresh_token``."""

    async def create(
        self,
        conn: AsyncConnection,
        investigator_id: int,
        token_hash: str,
        family_id: str,
        expires_at: dt.datetime,
    ) -> None:
        await conn.execute(
            """
            INSERT INTO bio.bio_refresh_token
                (investigator_id, token_hash, family_id, expires_at)
            VALUES (%s, %s, %s::uuid, %s)
            """,
            (investigator_id, token_hash, family_id, expires_at),
        )

    async def find_by_hash(
        self, conn: AsyncConnection, token_hash: str
    ) -> Optional[StoredRefreshToken]:
        row = await (
            await conn.execute(
                """
                SELECT id, investigator_id, token_hash, family_id::text,
                       expires_at, revoked_at
                  FROM bio.bio_refresh_token
                 WHERE token_hash = %s
                """,
                (token_hash,),
            )
        ).fetchone()
        if row is None:
            return None
        return StoredRefreshToken(
            id=row[0],
            investigator_id=row[1],
            token_hash=row[2],
            family_id=row[3],
            expires_at=row[4],
            revoked_at=row[5],
        )

    async def revoke(
        self, conn: AsyncConnection, token_id: int, at: dt.datetime
    ) -> None:
        await conn.execute(
            """
            UPDATE bio.bio_refresh_token
               SET revoked_at = %s
             WHERE id = %s
               AND revoked_at IS NULL
            """,
            (at, token_id),
        )

    async def revoke_family(
        self, conn: AsyncConnection, family_id: str, at: dt.datetime
    ) -> int:
        cursor = await conn.execute(
            """
            UPDATE bio.bio_refresh_token
               SET revoked_at = %s
             WHERE family_id = %s::uuid
               AND revoked_at IS NULL
            """,
            (at, family_id),
        )
        return cursor.rowcount