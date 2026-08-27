"""Integration tests against the live seeded DB.

Requires ``docker compose up -d db migrate seed`` to have completed.

Covers:
- login success path (with the dev credentials produced by the seed)
- login with wrong password -> 401 problem+json
- login with unknown email -> 401 problem+json
- GET /me without token -> 401
- GET /me with token -> 200, returns the right investigator
- refresh happy path + reuse detection -> 401
"""

import datetime as dt

import pytest


pytestmark = pytest.mark.asyncio


async def _seeded_credentials() -> tuple[str, str]:
    """Look up one investigator + their dev password from the seed output."""

    from app.db.actor import no_actor_connection

    async with no_actor_connection() as conn:
        row = await (
            await conn.execute(
                """
                SELECT i.id, i.email
                  FROM bio.bio_investigator i
                 ORDER BY i.id
                 LIMIT 1
                """,
            )
        ).fetchone()
    assert row is not None, "seed has not been run"
    investigator_id, email = row[0], row[1]
    return email, f"Bio-{investigator_id}"


async def test_login_me_refresh_roundtrip(client):
    email, password = await _seeded_credentials()

    # --- login ---
    r = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["token_type"] == "Bearer"
    assert body["investigator"]["email"] == email
    access_token = body["access_token"]
    refresh_token = body["refresh_token"]
    assert access_token and refresh_token

    # --- /me with the access token ---
    r = await client.get("/api/v1/me", headers={"authorization": f"Bearer {access_token}"})
    assert r.status_code == 200, r.text
    me = r.json()
    assert me["email"] == email
    assert me["accreditation_level"] in (1, 2, 3)

    # --- /me without a token ---
    r = await client.get("/api/v1/me")
    assert r.status_code == 401
    assert r.headers["content-type"].startswith("application/problem+json")
    assert r.json()["type"].endswith("/invalid-credentials") or r.json()["type"].endswith("/unauthorized")

    # --- refresh ---
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert r.status_code == 200, r.text
    refreshed = r.json()
    # The refresh token rotates (the access JWT may be identical if iat/exp
    # land on the same second; that is fine — the rotation contract is on
    # the refresh token, which is the security-critical artefact).
    new_refresh = refreshed["refresh_token"]
    assert new_refresh != refresh_token
    # The access token is well-formed and refers to the same investigator.
    new_access = refreshed["access_token"]
    r = await client.get("/api/v1/me", headers={"authorization": f"Bearer {new_access}"})
    assert r.status_code == 200, r.text
    assert r.json()["email"] == email

    # --- reuse the OLD refresh token -> 401 problem+json ---
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert r.status_code == 401
    err = r.json()
    assert err["type"].endswith("/refresh-token-reuse")


async def test_login_wrong_password_returns_problem_json(client):
    email, password = await _seeded_credentials()
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password + "-definitely-wrong"},
    )
    assert r.status_code == 401
    body = r.json()
    assert body["type"].endswith("/invalid-credentials")
    assert body["status"] == 401
    # RFC 9457: title + detail + instance
    assert body["title"]
    assert body["detail"]
    assert body["instance"] == "/api/v1/auth/login"


async def test_login_unknown_email_returns_problem_json(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@nowhere.example", "password": "x"},
    )
    assert r.status_code == 401
    assert r.json()["type"].endswith("/invalid-credentials")


async def test_request_id_roundtrip(client):
    """Inbound X-Request-Id is echoed on the response; absent id is generated."""

    rid = "test-request-12345"
    r = await client.get("/healthz", headers={"X-Request-Id": rid})
    assert r.status_code == 200
    assert r.headers.get("X-Request-Id") == rid

    # Generate one when absent.
    r = await client.get("/healthz")
    assert r.status_code == 200
    assert r.headers.get("X-Request-Id")
    assert len(r.headers["X-Request-Id"]) > 0


async def test_problem_json_validation_error(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": ""},
    )
    assert r.status_code == 422
    body = r.json()
    assert body["type"].endswith("/validation")
    assert "errors" in body