"""Domain ports — the contracts the use cases depend on.

Each port is a small Protocol. Adapters in ``app.adapters`` provide concrete
implementations. Use cases depend only on these Protocols, so the framework
(FastAPI), the DB driver (psycopg) and the crypto library (argon2 / PyJWT)
are all swappable from configuration.
"""

from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import Any, Optional, Protocol

from app.domain.value_objects import InvestigatorProfile


# ----- connection provider --------------------------------------------------


class ConnectionProvider(Protocol):
    """Yields an open ``AsyncConnection`` inside an active transaction.

    Two flavours:
        * ``actor(actor_id)`` — sets ``app.current_user_id`` so RLS applies.
        * ``no_actor()``       — for login/refresh, before the actor exists.

    Each method returns an async context manager; ``async with`` enters it
    and yields the connection on exit.

    Use cases depend on this port so unit tests can inject a fake that
    does not need a real database.
    """

    def actor(self, actor_id: int) -> Any: ...
    def no_actor(self) -> Any: ...


# ----- password hashing -----------------------------------------------------


class PasswordHasher(Protocol):
    """Argon2id-style password hashing (timing-safe verify)."""

    def hash(self, plaintext: str) -> str:
        """Return a self-contained encoded hash string."""

    def verify(self, plaintext: str, encoded_hash: str) -> bool:
        """Constant-time verification; ``False`` on malformed hash."""


# ----- JWT ------------------------------------------------------------------


@dataclass(frozen=True)
class AccessToken:
    """The opaque handle a client uses for authenticated requests."""

    token: str
    expires_at: dt.datetime


class TokenService(Protocol):
    """Issues short-lived access JWTs.

    Tokens carry ``sub = str(investigator_id)``; ``typ = "access"`` so a
    future change can introduce a second token type without breaking older
    verifiers. Accreditation is resolved per transaction from the database,
    never trusted from the claim.
    """

    def issue_access_token(self, investigator_id: int) -> AccessToken: ...
    def verify_access_token(self, token: str) -> int:
        """Return the investigator id from a valid access JWT; raise ``InvalidCredentialsError``."""


# ----- refresh token store --------------------------------------------------


@dataclass(frozen=True)
class RefreshTokenRecord:
    """The opaque handle the client uses to mint a new access token.

    The raw token is what the client holds; the store only ever sees the
    hash. ``family_id`` groups a chain of rotations; reuse of any token in
    a revoked family revokes every member.
    """

    token: str
    expires_at: dt.datetime
    family_id: str


@dataclass(frozen=True)
class StoredRefreshToken:
    """What the store sees of a refresh token."""

    id: int
    investigator_id: int
    token_hash: str
    family_id: str
    expires_at: dt.datetime
    revoked_at: Optional[dt.datetime]


class RefreshTokenStore(Protocol):
    """Persistence for refresh tokens (Postgres-backed in this project)."""

    async def create(
        self,
        investigator_id: int,
        token_hash: str,
        family_id: str,
        expires_at: dt.datetime,
    ) -> None: ...

    async def find_by_hash(self, token_hash: str) -> Optional[StoredRefreshToken]: ...

    async def revoke(self, token_id: int, at: dt.datetime) -> None: ...

    async def revoke_family(self, family_id: str, at: dt.datetime) -> int:
        """Revoke every active member of ``family_id``. Returns row count."""


# ----- investigator repository ----------------------------------------------


class InvestigatorRepository(Protocol):
    """Read access to investigators + their auth credentials."""

    async def find_by_email(self, email: str) -> Optional[tuple[InvestigatorProfile, str]]:
        """Return ``(profile, password_hash)`` for the email, or ``None``."""

    async def find_by_id(self, investigator_id: int) -> Optional[InvestigatorProfile]: ...