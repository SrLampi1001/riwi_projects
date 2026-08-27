"""RFC 9457 problem+json error handling.

Every error response is shaped as ``application/problem+json``:

    {
        "type": "https://bioma.example/errors/<slug>",
        "title": "<short summary>",
        "status": <http>,
        "detail": "<human readable>",
        "instance": "<request path>",
        "request_id": "<X-Request-Id>",
    }
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.domain.errors import (
    AuthenticationError,
    DomainError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    RefreshTokenReuseError,
)

PROBLEM_MEDIA_TYPE = "application/problem+json"
PROBLEM_TYPE_BASE = "https://bioma.example/errors"


def _problem(
    *,
    type_slug: str,
    title: str,
    status_code: int,
    detail: str,
    instance: str,
    request_id: str | None,
    extra: dict[str, Any] | None = None,
) -> JSONResponse:
    body: dict[str, Any] = {
        "type": f"{PROBLEM_TYPE_BASE}/{type_slug}",
        "title": title,
        "status": status_code,
        "detail": detail,
        "instance": instance,
    }
    if request_id:
        body["request_id"] = request_id
    if extra:
        body.update(extra)
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(body),
        media_type=PROBLEM_MEDIA_TYPE,
        headers={"X-Request-Id": request_id} if request_id else None,
    )


def install_error_handlers(app: FastAPI) -> None:
    """Register the problem+json handlers on a FastAPI app."""

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return _problem(
            type_slug="validation",
            title="Request validation failed",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="One or more fields failed validation.",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
            extra={"errors": exc.errors()},
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        slug_map = {401: "unauthorized", 403: "forbidden", 404: "not-found", 409: "conflict"}
        return _problem(
            type_slug=slug_map.get(exc.status_code, "http"),
            title=exc.detail if isinstance(exc.detail, str) else "HTTP error",
            status_code=exc.status_code,
            detail=str(exc.detail),
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(InvalidCredentialsError)
    async def _invalid_credentials(request: Request, exc: InvalidCredentialsError) -> JSONResponse:
        return _problem(
            type_slug="invalid-credentials",
            title="Invalid credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc) or "email or password is incorrect",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(InvalidRefreshTokenError)
    async def _invalid_refresh(request: Request, exc: InvalidRefreshTokenError) -> JSONResponse:
        return _problem(
            type_slug="invalid-refresh-token",
            title="Invalid refresh token",
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc) or "refresh token is invalid or expired",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(RefreshTokenReuseError)
    async def _refresh_reuse(request: Request, exc: RefreshTokenReuseError) -> JSONResponse:
        return _problem(
            type_slug="refresh-token-reuse",
            title="Refresh token reuse detected",
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
            or "refresh token reuse detected; the session family has been revoked",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(AuthenticationError)
    async def _authn(request: Request, exc: AuthenticationError) -> JSONResponse:
        return _problem(
            type_slug="unauthorized",
            title="Unauthorized",
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc) or "authentication required",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(DomainError)
    async def _domain(request: Request, exc: DomainError) -> JSONResponse:
        return _problem(
            type_slug="domain",
            title="Domain error",
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc) or "request could not be processed",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        # Log the exception server-side; respond with a problem document.
        # Request-id is enough for the operator to find the trace.
        return _problem(
            type_slug="internal",
            title="Internal server error",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
            instance=str(request.url.path),
            request_id=request.headers.get("X-Request-Id"),
        )