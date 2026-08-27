"""FastAPI dependencies and dependency-injection factories.

Use cases are constructed lazily via ``Depends`` so tests can override the
backing ports without touching module-level singletons.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Header

from app.adapters.connection_provider import DefaultConnectionProvider
from app.adapters.investigator_repo import PostgresInvestigatorRepository
from app.adapters.jwt_service import JWTTokenService
from app.adapters.passwords import Argon2PasswordHasher
from app.adapters.refresh_store import PostgresRefreshTokenStore
from app.domain.errors import InvalidCredentialsError
from app.domain.ports import (
    ConnectionProvider,
    InvestigatorRepository,
    PasswordHasher,
    RefreshTokenStore,
    TokenService,
)


# ----- use-case port factories (one instance per process is fine) -----------


def build_connection_provider() -> ConnectionProvider:
    return DefaultConnectionProvider()


def build_password_hasher() -> PasswordHasher:
    return Argon2PasswordHasher()


def build_token_service() -> TokenService:
    return JWTTokenService()


def build_refresh_store() -> RefreshTokenStore:
    return PostgresRefreshTokenStore()


def build_investigator_repository() -> InvestigatorRepository:
    return PostgresInvestigatorRepository()


# ----- current actor dependency --------------------------------------------


def get_current_actor_id(
    authorization: Annotated[str | None, Header()] = None,
) -> int:
    """Extract and verify the bearer token, return the investigator id.

    Raises ``InvalidCredentialsError`` (mapped to 401 by the error handler)
    when the header is missing, malformed, expired, or signed with the
    wrong key.
    """

    if not authorization or not authorization.lower().startswith("bearer "):
        raise InvalidCredentialsError("missing bearer token")
    raw = authorization.split(" ", 1)[1].strip()
    if not raw:
        raise InvalidCredentialsError("empty bearer token")

    token_service: TokenService = build_token_service()
    return token_service.verify_access_token(raw)