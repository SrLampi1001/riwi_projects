"""HTTP routers."""

from app.delivery.routers.auth import router as auth_router
from app.delivery.routers.health import router as health_router
from app.delivery.routers.investigators import router as investigators_router

__all__ = ["auth_router", "health_router", "investigators_router"]