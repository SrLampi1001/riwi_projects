"""Async psycopg connection pool (single pool, bioma_app role)."""

from __future__ import annotations

import logging
from typing import Optional

from psycopg_pool import AsyncConnectionPool

from app.config import get_settings

logger = logging.getLogger(__name__)

_pool: Optional[AsyncConnectionPool] = None


async def init_pool() -> AsyncConnectionPool:
    """Create the process-wide pool if it does not exist; return it."""

    global _pool
    if _pool is None:
        settings = get_settings()
        _pool = AsyncConnectionPool(
            conninfo=settings.database_url,
            min_size=settings.db_pool_min_size,
            max_size=settings.db_pool_max_size,
            kwargs={"autocommit": False},
            open=False,
        )
        await _pool.open(wait=True)
        logger.info("bioma_app pool opened", extra={"max_size": settings.db_pool_max_size})
    return _pool


async def close_pool() -> None:
    """Close the pool at shutdown."""

    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("bioma_app pool closed")


def pool() -> AsyncConnectionPool:
    """Return the live pool; raises if init_pool has not run yet."""

    if _pool is None:
        raise RuntimeError("Connection pool not initialised; call init_pool() first.")
    return _pool