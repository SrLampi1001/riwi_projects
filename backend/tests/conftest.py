"""Pytest configuration: shared fixtures, env setup."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest_asyncio

# Ensure ``app.*`` is importable.
_BACKEND = Path(__file__).resolve().parents[1]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

# Force APP_ENV=local so error envelopes stay dev-friendly.
os.environ.setdefault("APP_ENV", "local")

# Use the seeded DB connection by default; tests that need a clean DB
# override the fixtures below.
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://bioma_app:change_me_app@localhost:5432/bioma_local",
)


@pytest_asyncio.fixture(scope="session")
async def db_pool():
    """Open the bioma_app connection pool once per session."""

    from app.db.pool import close_pool, init_pool

    await init_pool()
    try:
        yield
    finally:
        await close_pool()


@pytest_asyncio.fixture(scope="session")
async def app(db_pool):
    """A FastAPI app with the real DB pool opened for the test session."""

    # Late import so sys.path is set first.
    from app.main import create_app

    application = create_app()
    return application


@pytest_asyncio.fixture()
async def client(app):
    """An httpx AsyncClient wired against the FastAPI app under ASGI."""

    import httpx
    from httpx import ASGITransport

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac