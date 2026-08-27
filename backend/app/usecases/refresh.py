"""Refresh use case.

Presenting a valid, unrevoked refresh token returns a new access JWT and a
new rotated refresh token in the same family. The old token is revoked; the
new one is persisted. Presenting an already-revoked token revokes the
entire family (reuse-detection) and raises ``RefreshTokenReuseError``.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import secrets

from app.config import get_settings
from app.domain.errors import (
    InvalidRefreshTokenError,
    RefreshTokenReuseError,
)
from app.domain.ports import (
    ConnectionProvider,
    InvestigatorRepository,
    RefreshTokenStore,
    TokenService,
)

from app.usecases.login import IssueRefreshToken, LoginResult, _hash_token, _new_refresh_token


class RefreshUseCase:
    """Rotates a refresh token; revokes the family on reuse."""

    def __init__(
        self,
        *,
        connection_provider: ConnectionProvider,
        investigators: InvestigatorRepository,
        token_service: TokenService,
        refresh_store: RefreshTokenStore,
    ) -> None:
        self._conn = connection_provider
        self._investigators = investigators
        self._tokens = token_service
        self._refresh = refresh_store

    async def execute(self, raw_token: str) -> LoginResult:
        if not raw_token:
            raise InvalidRefreshTokenError("empty refresh token")

        token_hash = _hash_token(raw_token)
        now = dt.datetime.now(dt.timezone.utc)

        async with self._conn.no_actor() as conn:
            record = await self._refresh.find_by_hash(conn, token_hash)
            if record is None:
                raise InvalidRefreshTokenError("unknown refresh token")
            if record.expires_at <= now:
                raise InvalidRefreshTokenError("refresh token expired")
            if record.revoked_at is not None:
                # Token reuse — revoke the whole family before failing.
                await self._refresh.revoke_family(conn, record.family_id, now)
                raise RefreshTokenReuseError("refresh token reuse detected")

            profile = await self._investigators.find_by_id(conn, record.investigator_id)
            if profile is None:
                # Authoritative record gone; treat as invalid token.
                raise InvalidRefreshTokenError("investigator no longer exists")

            # Revoke the presented token, then issue a fresh one in the same family.
            await self._refresh.revoke(conn, record.id, now)

            settings = get_settings()
            refresh_ttl = settings.jwt_refresh_ttl_seconds

            new_raw = _new_refresh_token()
            new_hash = _hash_token(new_raw)
            new_expires = now + dt.timedelta(seconds=refresh_ttl)
            await self._refresh.create(
                conn,
                investigator_id=record.investigator_id,
                token_hash=new_hash,
                family_id=record.family_id,
                expires_at=new_expires,
            )

            access = self._tokens.issue_access_token(profile.id)

        return LoginResult(
            access_token=access,
            refresh_token=IssueRefreshToken(token=new_raw, expires_at=new_expires),
            investigator=profile,
        )