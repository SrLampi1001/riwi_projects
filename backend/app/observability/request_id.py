"""X-Request-Id middleware.

Echoes the inbound header when present; otherwise generates a fresh UUID4.
The id is exposed to handlers via ``request.state.request_id`` and to
error responses via ``X-Request-Id``. Handlers read it from the request
headers in the error envelopes (see ``delivery/errors.py``).
"""

from __future__ import annotations

import uuid
from typing import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-Id"


def get_request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        incoming = request.headers.get(REQUEST_ID_HEADER)
        rid = incoming if incoming else str(uuid.uuid4())
        request.state.request_id = rid
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = rid
        return response