"""Domain layer: ports (interfaces) + value types.

No third-party dependencies. Adapters (in ``app.adapters``) implement the
ports; use cases depend on the ports, never on the adapters directly.
"""

from app.domain.ports import (
    ConnectionProvider,
    InvestigatorRepository,
    PasswordHasher,
    RefreshTokenStore,
    TokenService,
)
from app.domain.value_objects import InvestigatorProfile
from app.domain.errors import (
    AuthenticationError,
    DomainError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    RefreshTokenReuseError,
)

__all__ = [
    "ConnectionProvider",
    "InvestigatorRepository",
    "PasswordHasher",
    "RefreshTokenStore",
    "TokenService",
    "InvestigatorProfile",
    "DomainError",
    "AuthenticationError",
    "InvalidCredentialsError",
    "InvalidRefreshTokenError",
    "RefreshTokenReuseError",
]