"""Domain value objects."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class InvestigatorProfile:
    """Read-only investigator view used by the API.

    Mirrors the joined columns exposed to the application role
    (``bio_investigator`` + ``bio_position`` + ``bio_accreditation``).
    """

    id: int
    name: str
    email: str
    position: str
    accreditation_level: int