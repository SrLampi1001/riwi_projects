"""Unit tests for refresh-token rotation logic.

Drives ``RefreshUseCase`` against an in-memory ``FakeRefreshTokenStore``
and a stub ``TokenService`` to exercise the happy path, the
already-revoked-token path (revokes the whole family), and the
unknown-token path. Uses a ``FakeConnectionProvider`` so no real DB is
required for the unit test.
"""

import datetime as dt
from contextlib import asynccontextmanager
from typing import Optional

import pytest

from app.domain.errors import (
    InvalidRefreshTokenError,
    RefreshTokenReuseError,
)
from app.domain.ports import (
    AccessToken,
    InvestigatorRepository,
    RefreshTokenStore,
    StoredRefreshToken,
    TokenService,
)
from app.domain.value_objects import InvestigatorProfile
from app.usecases.refresh import RefreshUseCase


class FakeConnectionProvider:
    @asynccontextmanager
    async def actor(self, actor_id):
        yield None

    @asynccontextmanager
    async def no_actor(self):
        yield None


class FakeStore(RefreshTokenStore):
    def __init__(self):
        self.rows: dict[str, StoredRefreshToken] = {}
        self._next_id = 1

    async def create(self, conn, investigator_id, token_hash, family_id, expires_at):
        self.rows[token_hash] = StoredRefreshToken(
            id=self._next_id,
            investigator_id=investigator_id,
            token_hash=token_hash,
            family_id=family_id,
            expires_at=expires_at,
            revoked_at=None,
        )
        self._next_id += 1

    async def find_by_hash(self, conn, token_hash):
        return self.rows.get(token_hash)

    async def revoke(self, conn, token_id, at):
        for row in list(self.rows.values()):
            if row.id == token_id and row.revoked_at is None:
                self.rows[row.token_hash] = StoredRefreshToken(
                    id=row.id,
                    investigator_id=row.investigator_id,
                    token_hash=row.token_hash,
                    family_id=row.family_id,
                    expires_at=row.expires_at,
                    revoked_at=at,
                )

    async def revoke_family(self, conn, family_id, at):
        n = 0
        for token_hash, row in list(self.rows.items()):
            if row.family_id == family_id and row.revoked_at is None:
                self.rows[token_hash] = StoredRefreshToken(
                    id=row.id,
                    investigator_id=row.investigator_id,
                    token_hash=row.token_hash,
                    family_id=row.family_id,
                    expires_at=row.expires_at,
                    revoked_at=at,
                )
                n += 1
        return n


class StubTokenService(TokenService):
    def __init__(self):
        self.issued = []

    def issue_access_token(self, investigator_id):
        self.issued.append(investigator_id)
        return AccessToken(token=f"access-{investigator_id}", expires_at=dt.datetime.now(dt.timezone.utc))

    def verify_access_token(self, token):
        raise NotImplementedError


class StubInvestigatorRepo(InvestigatorRepository):
    def __init__(self, profile: InvestigatorProfile):
        self._profile = profile

    async def find_by_email(self, conn, email):
        return None

    async def find_by_id(self, conn, investigator_id):
        return self._profile


def _profile():
    return InvestigatorProfile(
        id=42,
        name="Test User",
        email="test@example.com",
        position="field_biologist",
        accreditation_level=2,
    )


@pytest.mark.asyncio
async def test_refresh_happy_path():
    """Presenting a valid token returns a fresh pair and revokes the old token."""

    import hashlib
    store = FakeStore()
    raw = "old-raw-token"
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    now = dt.datetime.now(dt.timezone.utc)
    exp = now + dt.timedelta(days=30)
    family_id = "11111111-1111-1111-1111-111111111111"

    await store.create(
        conn=None,
        investigator_id=42,
        token_hash=token_hash,
        family_id=family_id,
        expires_at=exp,
    )

    tokens = StubTokenService()
    repo = StubInvestigatorRepo(_profile())
    usecase = RefreshUseCase(
        connection_provider=FakeConnectionProvider(),
        investigators=repo,
        token_service=tokens,
        refresh_store=store,
    )

    result = await usecase.execute(raw)

    assert store.rows[token_hash].revoked_at is not None
    new_rows = [r for r in store.rows.values() if r.family_id == family_id]
    assert len(new_rows) == 2
    assert tokens.issued == [42]
    assert result.investigator.id == 42


@pytest.mark.asyncio
async def test_refresh_reuse_revokes_whole_family():
    """Presenting a revoked token revokes every member of its family."""

    import hashlib
    store = FakeStore()
    raw = "old-raw-token"
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    sibling_raw = "sibling-raw"
    sibling_hash = hashlib.sha256(sibling_raw.encode()).hexdigest()

    now = dt.datetime.now(dt.timezone.utc)
    exp = now + dt.timedelta(days=30)
    family_id = "22222222-2222-2222-2222-222222222222"

    await store.create(conn=None, investigator_id=42, token_hash=token_hash, family_id=family_id, expires_at=exp)
    await store.create(conn=None, investigator_id=42, token_hash=sibling_hash, family_id=family_id, expires_at=exp)
    await store.revoke(conn=None, token_id=1, at=now)

    tokens = StubTokenService()
    repo = StubInvestigatorRepo(_profile())
    usecase = RefreshUseCase(
        connection_provider=FakeConnectionProvider(),
        investigators=repo,
        token_service=tokens,
        refresh_store=store,
    )

    with pytest.raises(RefreshTokenReuseError):
        await usecase.execute(raw)

    assert all(r.revoked_at is not None for r in store.rows.values())


@pytest.mark.asyncio
async def test_refresh_unknown_token_raises():
    """An unknown token raises InvalidRefreshTokenError without touching the store."""

    store = FakeStore()
    tokens = StubTokenService()
    repo = StubInvestigatorRepo(_profile())
    usecase = RefreshUseCase(
        connection_provider=FakeConnectionProvider(),
        investigators=repo,
        token_service=tokens,
        refresh_store=store,
    )

    with pytest.raises(InvalidRefreshTokenError):
        await usecase.execute("never-issued-token")


@pytest.mark.asyncio
async def test_refresh_empty_token_raises():
    store = FakeStore()
    tokens = StubTokenService()
    repo = StubInvestigatorRepo(_profile())
    usecase = RefreshUseCase(
        connection_provider=FakeConnectionProvider(),
        investigators=repo,
        token_service=tokens,
        refresh_store=store,
    )

    with pytest.raises(InvalidRefreshTokenError):
        await usecase.execute("")