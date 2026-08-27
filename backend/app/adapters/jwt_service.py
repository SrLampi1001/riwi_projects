"""HS256 JWT token service.

Access tokens carry ``sub = str(investigator_id)``, ``typ = "access"`` and
the configured issuer. ``typ`` is reserved so a future refresh-token
JWT variant (if we ever move off opaque refresh tokens) cannot be confused
with an access token.
"""

from __future__ import annotations

import datetime as dt
from typing import Any

import jwt as pyjwt
from jwt import InvalidTokenError

from app.config import get_settings
from app.domain.errors import InvalidCredentialsError
from app.domain.ports import AccessToken, TokenService


class JWTTokenService:
    """Encodes/decodes short-lived access JWTs."""

    def __init__(self) -> None:
        s = get_settings()
        self._secret: str = s.jwt_secret.get_secret_value()
        self._algorithm: str = s.jwt_algorithm
        self._ttl: int = s.jwt_access_ttl_seconds
        self._issuer: str = s.jwt_issuer

    def issue_access_token(self, investigator_id: int) -> AccessToken:
        now = dt.datetime.now(dt.timezone.utc)
        exp = now + dt.timedelta(seconds=self._ttl)
        payload: dict[str, Any] = {
            "sub": str(investigator_id),
            "typ": "access",
            "iss": self._issuer,
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp()),
        }
        token = pyjwt.encode(payload, self._secret, algorithm=self._algorithm)
        return AccessToken(token=token, expires_at=exp)

    def verify_access_token(self, token: str) -> int:
        try:
            payload = pyjwt.decode(
                token,
                self._secret,
                algorithms=[self._algorithm],
                issuer=self._issuer,
                options={"require": ["sub", "exp", "iat", "iss", "typ"]},
            )
        except InvalidTokenError as exc:
            raise InvalidCredentialsError(f"invalid token: {exc}") from exc

        typ = payload.get("typ")
        if typ != "access":
            raise InvalidCredentialsError(f"unexpected token type: {typ!r}")

        sub = payload.get("sub")
        if not isinstance(sub, str) or not sub.isdigit():
            raise InvalidCredentialsError(f"invalid sub: {sub!r}")
        return int(sub)