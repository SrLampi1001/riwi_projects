"""Domain-level errors.

Use cases raise these; the delivery layer translates them into
``application/problem+json`` responses (RFC 9457). Status codes live in
the delivery layer because the transport is a transport concern.
"""

from __future__ import annotations


class DomainError(Exception):
    """Base class for domain errors. Subclasses map to specific status codes."""


class AuthenticationError(DomainError):
    """Generic 401. Login or refresh failed for an authentication reason."""


class InvalidCredentialsError(AuthenticationError):
    """Wrong email or password during login."""


class InvalidRefreshTokenError(AuthenticationError):
    """Refresh token not found / expired / already revoked."""


class RefreshTokenReuseError(AuthenticationError):
    """A refresh token from a revoked family was presented.

    The whole family has been revoked server-side; the client must
    restart the login flow.
    """