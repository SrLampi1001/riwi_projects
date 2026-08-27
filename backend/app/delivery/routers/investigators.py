"""Investigator router — self endpoint (``/me``)."""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr

from app.delivery.dependencies import (
    build_connection_provider,
    build_investigator_repository,
    get_current_actor_id,
)
from app.domain.value_objects import InvestigatorProfile
from app.usecases.get_me import GetMeUseCase


router = APIRouter(prefix="/api/v1", tags=["investigators"])


class InvestigatorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    position: str
    accreditation_level: int


def _to_out(p: InvestigatorProfile) -> InvestigatorOut:
    return InvestigatorOut(
        id=p.id,
        name=p.name,
        email=p.email,
        position=p.position,
        accreditation_level=p.accreditation_level,
    )


@router.get(
    "/me",
    response_model=InvestigatorOut,
    status_code=status.HTTP_200_OK,
    summary="Return the authenticated investigator's profile.",
)
async def me(actor_id: int = Depends(get_current_actor_id)) -> InvestigatorOut:
    usecase = GetMeUseCase(
        connection_provider=build_connection_provider(),
        investigators=build_investigator_repository(),
    )
    profile = await usecase.execute(actor_id)
    return _to_out(profile)