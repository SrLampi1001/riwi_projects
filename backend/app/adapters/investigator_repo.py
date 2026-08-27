"""Postgres adapter for ``bio_investigator`` + ``bio_auth_credential``."""

from __future__ import annotations

from typing import Optional

from psycopg import AsyncConnection

from app.domain.value_objects import InvestigatorProfile


class PostgresInvestigatorRepository:
    """Read-only repository; auth_credential writes are owned by the seed."""

    async def find_by_email(
        self, conn: AsyncConnection, email: str
    ) -> Optional[tuple[InvestigatorProfile, str]]:
        row = await (
            await conn.execute(
                """
                SELECT i.id, i.name, i.email,
                       p.name      AS position_name,
                       a.level     AS accreditation_level,
                       c.password_hash
                  FROM bio.bio_investigator  i
                  JOIN bio.bio_position       p ON p.id = i.position_id
                  JOIN bio.bio_accreditation  a ON a.id = i.accreditation_id
                  LEFT JOIN bio.bio_auth_credential c
                         ON c.investigator_id = i.id
                 WHERE i.email = %s
                """,
                (email,),
            )
        ).fetchone()
        if row is None:
            return None
        profile = InvestigatorProfile(
            id=row[0],
            name=row[1],
            email=row[2],
            position=row[3],
            accreditation_level=row[4],
        )
        password_hash = row[5] or ""
        return profile, password_hash

    async def find_by_id(
        self, conn: AsyncConnection, investigator_id: int
    ) -> Optional[InvestigatorProfile]:
        row = await (
            await conn.execute(
                """
                SELECT i.id, i.name, i.email,
                       p.name  AS position_name,
                       a.level AS accreditation_level
                  FROM bio.bio_investigator i
                  JOIN bio.bio_position      p ON p.id = i.position_id
                  JOIN bio.bio_accreditation a ON a.id = i.accreditation_id
                 WHERE i.id = %s
                """,
                (investigator_id,),
            )
        ).fetchone()
        if row is None:
            return None
        return InvestigatorProfile(
            id=row[0],
            name=row[1],
            email=row[2],
            position=row[3],
            accreditation_level=row[4],
        )