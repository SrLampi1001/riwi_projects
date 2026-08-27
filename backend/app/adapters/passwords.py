"""argon2id password hasher.

The encoded hash is self-contained (it carries its own salt + parameters),
so verification needs no extra state. ``argon2-cffi`` uses Argon2id by
default, which is the recommended variant per ARCHITECTURE.md §7.
"""

from __future__ import annotations

from argon2 import PasswordHasher as _Argon2PasswordHasher
from argon2.exceptions import (
    InvalidHashError,
    VerifyMismatchError,
    VerificationError,
)


class Argon2PasswordHasher:
    """Thin wrapper around ``argon2-cffi`` with type-safe verify."""

    def __init__(self, time_cost: int = 3, memory_cost: int = 65536, parallelism: int = 1) -> None:
        self._hasher = _Argon2PasswordHasher(
            time_cost=time_cost,
            memory_cost=memory_cost,
            parallelism=parallelism,
        )

    def hash(self, plaintext: str) -> str:
        return self._hasher.hash(plaintext)

    def verify(self, plaintext: str, encoded_hash: str) -> bool:
        try:
            return self._hasher.verify(encoded_hash, plaintext)
        except (VerifyMismatchError, InvalidHashError, VerificationError):
            return False