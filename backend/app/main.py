"""FastAPI application factory.

Wires:
- structlog
- request-id middleware
- the bioma_app connection pool (lifespan)
- problem+json error handlers
- routers: health, auth, investigators
"""

from __future__ import annotations

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI

from app.config import get_settings
from app.db.pool import close_pool, init_pool
from app.delivery.errors import install_error_handlers
from app.delivery.routers.auth import router as auth_router
from app.delivery.routers.health import router as health_router
from app.delivery.routers.investigators import router as investigators_router
from app.observability.logging import configure_logging
from app.observability.request_id import RequestIdMiddleware


logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_logging()
    await init_pool()
    logger.info("bioma_backend_ready")
    try:
        yield
    finally:
        await close_pool()
        logger.info("bioma_backend_shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Bioma API",
        version="0.1.0",
        description=(
            "Wildlife monitoring for Fundación Yarumo. "
            "Auth + sighting endpoints; copilot and write paths ship in later PRs."
        ),
        lifespan=lifespan,
        openapi_tags=[
            {"name": "health", "description": "Liveness/readiness probes."},
            {"name": "auth", "description": "Login + refresh-token rotation."},
            {"name": "investigators", "description": "Profile + researcher lookup."},
        ],
    )
    app.add_middleware(RequestIdMiddleware)
    install_error_handlers(app)
    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(investigators_router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    s = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        log_level=s.log_level.lower(),
    )