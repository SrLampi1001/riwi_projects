"""Runtime configuration sourced from environment variables."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven settings.

    Values are read from the process environment (and from a sibling ``.env``
    in the working directory, via ``pydantic-settings``). Defaults match the
    docker-compose defaults so ``uvicorn app.main:app`` works against a stack
    booted with ``docker compose up``.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Database ---
    database_url: str = Field(
        default="postgresql://bioma_app:change_me_app@localhost:5432/bioma_local",
        description="psycopg connection string. Must point at bioma_app (NOBYPASSRLS).",
    )
    db_pool_min_size: int = Field(default=1, ge=1)
    db_pool_max_size: int = Field(default=8, ge=1)

    # --- Auth ---
    jwt_secret: SecretStr = Field(
        default=SecretStr("change_me_jwt_secret"),
        description="HS256 signing key. Override in every non-local environment.",
    )
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_ttl_seconds: int = Field(default=900, ge=60)
    jwt_refresh_ttl_seconds: int = Field(default=2592000, ge=3600)
    jwt_issuer: str = Field(default="bioma")

    # --- Runtime ---
    app_env: str = Field(default="local")
    log_level: str = Field(default="INFO")

    # --- AI providers (declared for future PRs; not consumed yet) ---
    mistral_api_key: SecretStr | None = Field(default=None)
    mistral_base_url: str = Field(default="https://api.mistral.ai/v1")
    mistral_embed_model: str = Field(default="mistral-embed")
    nvidia_nim_api_key: SecretStr | None = Field(default=None)
    nvidia_nim_base_url: str = Field(default="https://integrate.api.nvidia.com/v1")
    nvidia_nim_chat_model: str = Field(default="meta/llama-3.3-70b-instruct")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor. Tests override the cache via ``get_settings.cache_clear()``."""

    return Settings()