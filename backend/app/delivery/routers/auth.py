"""Auth + investigators + health routers."""

from fastapi import APIRouter, status
from pydantic import BaseModel, EmailStr, Field

from app.domain.ports import InvestigatorProfile
from app.usecases.get_me import GetMeUseCase
from app.usecases.login import LoginResult, LoginUseCase
from app.usecases.refresh import RefreshUseCase
from app.delivery.dependencies import (
    build_connection_provider,
    build_investigator_repository,
    build_password_hasher,
    build_refresh_store,
    build_token_service,
)


router = APIRouter(prefix="/api/v1", tags=["auth"])


# ----- request / response schemas -------------------------------------------


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=512)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1, max_length=512)


class InvestigatorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    position: str
    accreditation_level: int


class TokenPairOut(BaseModel):
    access_token: str
    access_token_expires_at: str
    refresh_token: str
    refresh_token_expires_at: str
    token_type: str = "Bearer"
    investigator: InvestigatorOut


def _profile_to_dict(p: InvestigatorProfile) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "email": p.email,
        "position": p.position,
        "accreditation_level": p.accreditation_level,
    }


def _to_pair(result: LoginResult) -> TokenPairOut:
    return TokenPairOut(
        access_token=result.access_token.token,
        access_token_expires_at=result.access_token.expires_at.isoformat(),
        refresh_token=result.refresh_token.token,
        refresh_token_expires_at=result.refresh_token.expires_at.isoformat(),
        investigator=InvestigatorOut(**_profile_to_dict(result.investigator)),
    )


# ----- use-case factories ---------------------------------------------------


def _make_login_usecase() -> LoginUseCase:
    return LoginUseCase(
        connection_provider=build_connection_provider(),
        investigators=build_investigator_repository(),
        password_hasher=build_password_hasher(),
        token_service=build_token_service(),
        refresh_store=build_refresh_store(),
    )


def _make_refresh_usecase() -> RefreshUseCase:
    return RefreshUseCase(
        connection_provider=build_connection_provider(),
        investigators=build_investigator_repository(),
        token_service=build_token_service(),
        refresh_store=build_refresh_store(),
    )


# ----- endpoints -----------------------------------------------------------


@router.post(
    "/auth/login",
    response_model=TokenPairOut,
    status_code=status.HTTP_200_OK,
    summary="Authenticate with email + password; returns access + refresh tokens.",
)
async def login(payload: LoginRequest) -> TokenPairOut:
    usecase = _make_login_usecase()
    result = await usecase.execute(payload.email, payload.password)
    return _to_pair(result)


@router.post(
    "/auth/refresh",
    response_model=TokenPairOut,
    status_code=status.HTTP_200_OK,
    summary="Rotate a refresh token; returns a new access + refresh pair.",
)
async def refresh(payload: RefreshRequest) -> TokenPairOut:
    usecase = _make_refresh_usecase()
    result = await usecase.execute(payload.refresh_token)
    return _to_pair(result)