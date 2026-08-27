"""Connection-provider adapter — wraps the real psycopg pool."""

from __future__ import annotations

from typing import Any

from app.db.actor import actor_connection, no_actor_connection


class DefaultConnectionProvider:
    """Wraps the live ``bioma_app`` pool as a connection provider port."""

    def actor(self, actor_id: int) -> Any:
        return actor_connection(actor_id)

    def no_actor(self) -> Any:
        return no_actor_connection()