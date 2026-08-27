"""Unit tests — pure logic, no DB or HTTP."""

from app.adapters.passwords import Argon2PasswordHasher
from app.adapters.jwt_service import JWTTokenService
from app.domain.errors import InvalidCredentialsError


def test_argon2_roundtrip():
    h = Argon2PasswordHasher()
    encoded = h.hash("Bio-1")
    assert h.verify("Bio-1", encoded) is True
    assert h.verify("wrong", encoded) is False


def test_argon2_handles_malformed_hash():
    h = Argon2PasswordHasher()
    assert h.verify("anything", "not-a-real-argon2-hash") is False


def test_jwt_roundtrip_and_expiry(monkeypatch):
    # Stable secret + TTL for the test.
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("JWT_ACCESS_TTL_SECONDS", "60")
    monkeypatch.setenv("APP_ENV", "local")
    from app.config import get_settings
    get_settings.cache_clear()

    svc = JWTTokenService()
    tok = svc.issue_access_token(42)
    assert svc.verify_access_token(tok.token) == 42


def test_jwt_rejects_bad_signature(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret-a")
    monkeypatch.setenv("APP_ENV", "local")
    from app.config import get_settings
    get_settings.cache_clear()

    svc_a = JWTTokenService()
    tok = svc_a.issue_access_token(7)

    monkeypatch.setenv("JWT_SECRET", "test-secret-b")
    get_settings.cache_clear()
    svc_b = JWTTokenService()
    import pytest
    with pytest.raises(InvalidCredentialsError):
        svc_b.verify_access_token(tok.token)


def test_jwt_rejects_wrong_typ(monkeypatch):
    """A token whose ``typ`` claim is not ``access`` must be rejected."""

    import jwt as pyjwt
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("APP_ENV", "local")
    from app.config import get_settings
    get_settings.cache_clear()
    svc = JWTTokenService()

    bad = pyjwt.encode(
        {"sub": "1", "typ": "evil", "iss": "bioma", "iat": 0, "exp": 9_999_999_999},
        "test-secret",
        algorithm="HS256",
    )
    import pytest
    with pytest.raises(InvalidCredentialsError):
        svc.verify_access_token(bad)


def test_jwt_rejects_non_numeric_substring(monkeypatch):
    import jwt as pyjwt
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("APP_ENV", "local")
    from app.config import get_settings
    get_settings.cache_clear()
    svc = JWTTokenService()

    bad = pyjwt.encode(
        {"sub": "not-a-number", "typ": "access", "iss": "bioma", "iat": 0, "exp": 9_999_999_999},
        "test-secret",
        algorithm="HS256",
    )
    import pytest
    with pytest.raises(InvalidCredentialsError):
        svc.verify_access_token(bad)


def test_jwt_rejects_expired(monkeypatch):
    """Expired token must be rejected with InvalidCredentialsError."""

    import jwt as pyjwt
    import datetime as dt
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("APP_ENV", "local")
    from app.config import get_settings
    get_settings.cache_clear()
    svc = JWTTokenService()

    past = int((dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=1)).timestamp())
    iat = past - 60
    expired = pyjwt.encode(
        {"sub": "1", "typ": "access", "iss": "bioma", "iat": iat, "exp": past},
        "test-secret",
        algorithm="HS256",
    )
    import pytest
    with pytest.raises(InvalidCredentialsError):
        svc.verify_access_token(expired)