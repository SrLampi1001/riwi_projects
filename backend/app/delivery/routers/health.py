"""Healthcheck router (no auth)."""

from fastapi import APIRouter, status
from pydantic import BaseModel


router = APIRouter(tags=["health"])


class HealthOut(BaseModel):
    status: str = "ok"


@router.get(
    "/healthz",
    response_model=HealthOut,
    status_code=status.HTTP_200_OK,
    summary="Liveness/readiness probe. No auth.",
)
async def healthz() -> HealthOut:
    return HealthOut()