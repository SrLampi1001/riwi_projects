"""Login use case.

Validates email + password against ``bio_investigator`` + ``bio_auth_credential``,
issues a short-lived access JWT and persists a fresh refresh token in a new
family. Runs as ``bioma_app`` with **no actor** (the actor is not yet known).
"""

from __future__ import annotations

import datetime as dt
import hashlib
import secrets
import uuid
from dataclasses import dataclass

from app.config import get_settings
from app.domain.errors import InvalidCredentialsError
from app.domain.ports import (
    AccessToken,
    ConnectionProvider,
    InvestigatorRepository,
    PasswordHasher,
    RefreshTokenStore,
    TokenService,
)
from app.domain.value_objects import InvestigatorProfile


@dataclass(frozen=True)
class IssueRefreshToken:
    """The refresh-token handle the API returns to the client."""

    token: str
    expires_at: dt.datetime


@dataclass(frozen=True)
class LoginResult:
    """Combined payload returned from login + refresh."""

    access_token: AccessToken
    refresh_token: IssueRefreshToken
    investigator: InvestigatorProfile


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _new_refresh_token() -> str:
    return secrets.token_urlsafe(32)


class LoginUseCase:
    """Email + password → access JWT + refresh token + investigator profile."""

    def __init__(
        self,
        *,
        connection_provider: ConnectionProvider,
        investigators: InvestigatorRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
        refresh_store: RefreshTokenStore,
    ) -> None:
        self._conn = connection_provider
        self._investigators = investigators
        self._passwords = password_hasher
        self._tokens = token_service
        self._refresh = refresh_store

    async def execute(self, email: str, password: str) -> LoginResult:
        if not email or not password:
            raise InvalidCredentialsError("email and password are required")

        settings = get_settings()
        refresh_ttl = settings.jwt_refresh_ttl_seconds

        async with self._conn.no_actor() as conn:
            found = await self._investigators.find_by_email(conn, email.lower())
            if found is None:
                raise InvalidCredentialsError("unknown email")
            profile, password_hash = found

            if not password_hash or not self._passwords.verify(password, password_hash):
                raise InvalidCredentialsError("password mismatch")

            access = self._tokens.issue_access_token(profile.id)

            raw = _new_refresh_token()
            token_hash = _hash_token(raw)
            family_id = str(uuid.uuid4())
            expires_at = dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=refresh_ttl)

            await self._refresh.create(
                conn,
                investigator_id=profile.id,
                token_hash=token_hash,
                family_id=family_id,
                expires_at=expires_at,
            )

        return LoginResult(
            access_token=access,
            refresh_token=IssueRefreshToken(token=raw, expires_at=expires_at),
            investigator=profile,
        )