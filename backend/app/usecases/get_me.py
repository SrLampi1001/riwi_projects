"""GetMe use case.

Returns the investigator profile for the current actor. Runs under an
authenticated ``actor_connection`` so the read goes through RLS (the
investigator table itself has no RLS policy, but the contract — actor is
set before any read — is enforced here).
"""

from __future__ import annotations

from app.domain.errors import AuthenticationError
from app.domain.ports import ConnectionProvider, InvestigatorRepository
from app.domain.value_objects import InvestigatorProfile


class GetMeUseCase:
    def __init__(
        self,
        *,
        connection_provider: ConnectionProvider,
        investigators: InvestigatorRepository,
    ) -> None:
        self._conn = connection_provider
        self._investigators = investigators

    async def execute(self, actor_id: int) -> InvestigatorProfile:
        async with self._conn.actor(actor_id) as conn:
            profile = await self._investigators.find_by_id(conn, actor_id)
        if profile is None:
            raise AuthenticationError("actor no longer exists")
        return profile