"""Medallion seed: Bronze -> Silver for the Bioma seed corpus.

Reads docs/seed.json (or $SEED_JSON_PATH) and loads it into:

  * Bronze: bio_stg_seed_sighting(payload jsonb)  -- raw, idempotent.
  * Silver: bio_* normalized 3FN tables          -- upserts from the bronze.
  * bio_auth_credential (per investigator)        -- with deterministic dev
    passwords ``Bio-{investigator_id}``. Printed to stdout at the end so
    the API can be curl-tested end-to-end.

Run as `bioma_owner` so it can bypass RLS for the load. Re-running is safe:
every upsert is idempotent.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import psycopg
from argon2 import PasswordHasher as _Argon2PasswordHasher


# ----- configuration ---------------------------------------------------------

# Default to docs/seed.json relative to the project root (the layout used
# when the script is invoked locally via `python db/seed/seed.py`). Inside
# the ops/seed container the SEED_JSON_PATH env var is set to the bundled
# copy at /seed/seed.json (see ops/seed/Dockerfile).
try:
    _DEFAULT_SEED_JSON = Path(__file__).resolve().parents[2] / "docs" / "seed.json"
except IndexError:
    _DEFAULT_SEED_JSON = Path("/seed/seed.json")

SEED_JSON_PATH = Path(os.environ.get("SEED_JSON_PATH", str(_DEFAULT_SEED_JSON)))
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://bioma_owner:change_me_owner@db:5432/bioma_local",
)

# ----- data model ------------------------------------------------------------


@dataclass(frozen=True)
class Investigator:
    name: str
    email: str
    position_name: str  # canonical English id, e.g. "field_biologist"
    accreditation_level: int


@dataclass(frozen=True)
class Species:
    common_name: str
    scientific_name: str
    iucn_code: str


@dataclass(frozen=True)
class Site:
    name: str
    region: str


@dataclass(frozen=True)
class Sighting:
    obs_ref: str
    investigator_email: str
    species_scientific_name: str
    site_name: str
    site_region: str
    classification: int  # 1, 2, 3
    latitude: float
    longitude: float
    note_body: str
    registered_at: str  # ISO timestamp
    edited_at: str | None
    anulado: bool


# ----- mappings --------------------------------------------------------------

# Spanish position labels from the corpus -> canonical English ids in DB.
POSITION_CANONICAL = {
    "Tecnica de Campo": "field_technician",
    "Técnica de Campo": "field_technician",
    "Biologo de Campo": "field_biologist",
    "Biólogo de Campo": "field_biologist",
    "Coordinadora Cientifica": "scientific_coordinator",
    "Coordinadora Científica": "scientific_coordinator",
}

# Spanish classification strings -> DB integers.
CLASSIFICATION_INT = {"publico": 1, "restringido": 2, "confidencial": 3}

# IUCN code mapping (the seed already uses 2-letter codes; this is a safety net).
IUCN_CODES = {"LC", "NT", "VU", "EN", "CR", "EW", "EX"}


# ----- parsing ---------------------------------------------------------------


def _normalize_position(raw: str) -> str:
    canonical = POSITION_CANONICAL.get(raw.strip())
    if canonical is None:
        raise ValueError(f"unknown position label in seed: {raw!r}")
    return canonical


def _normalize_classification(raw: str) -> int:
    value = CLASSIFICATION_INT.get(raw.strip().lower())
    if value is None:
        raise ValueError(f"unknown classification in seed: {raw!r}")
    return value


def parse_seed(payload: dict[str, Any]) -> tuple[list[Investigator], list[Species], list[Site], list[Sighting]]:
    rows = payload.get("avistamientos", [])
    investigators: dict[str, Investigator] = {}
    species: dict[str, Species] = {}
    sites: dict[tuple[str, str], Site] = {}
    sightings: list[Sighting] = []

    for r in rows:
        email = r["investigador_email"].strip().lower()
        if email not in investigators:
            investigators[email] = Investigator(
                name=r["investigador_nombre"].strip(),
                email=email,
                position_name=_normalize_position(r["investigador_cargo"]),
                accreditation_level=int(r["investigador_acreditacion"]),
            )

        sci = r["especie_cientifica"].strip()
        if sci not in species:
            iucn = r["categoria_iucn"].strip().upper()
            if iucn not in IUCN_CODES:
                raise ValueError(f"unknown IUCN code in seed: {iucn!r}")
            species[sci] = Species(
                common_name=r["especie_comun"].strip(),
                scientific_name=sci,
                iucn_code=iucn,
            )

        site_key = (r["sitio_nombre"].strip(), r["sitio_region"].strip())
        sites.setdefault(
            site_key,
            Site(name=site_key[0], region=site_key[1]),
        )

        sightings.append(
            Sighting(
                obs_ref=r["obs_ref"].strip(),
                investigator_email=email,
                species_scientific_name=sci,
                site_name=site_key[0],
                site_region=site_key[1],
                classification=_normalize_classification(r["clasificacion"]),
                latitude=float(r["latitud_exacta"]),
                longitude=float(r["longitud_exacta"]),
                note_body=r["notas_campo"].strip(),
                registered_at=r["registrado_en"],
                edited_at=r.get("editado_en"),
                anulado=bool(r.get("anulado", False)),
            )
        )

    return list(investigators.values()), list(species.values()), list(sites.values()), sightings


# ----- loaders ---------------------------------------------------------------


def ensure_bronze_table(conn: psycopg.Connection) -> None:
    """No-op kept for backwards compatibility.

    The bronze staging table is created by migration ``0009_seed_workspace``
    so it lives alongside the rest of the schema. The seed container
    therefore does not need CREATE on schema ``bio``.
    """
    del conn


def load_bronze(conn: psycopg.Connection, raw_rows: list[dict[str, Any]]) -> int:
    with conn.cursor() as cur:
        for row in raw_rows:
            cur.execute(
                """
                INSERT INTO bio.bio_stg_seed_sighting (obs_ref, payload)
                VALUES (%s, %s::jsonb)
                ON CONFLICT (obs_ref) DO NOTHING
                """,
                (row["obs_ref"], json.dumps(row)),
            )
    conn.commit()
    return len(raw_rows)


def load_silver(
    conn: psycopg.Connection,
    investigators: list[Investigator],
    species_list: list[Species],
    sites: list[Site],
    sightings: list[Sighting],
) -> None:
    with conn.cursor() as cur:
        # positions
        for inv in investigators:
            cur.execute(
                "INSERT INTO bio.bio_position (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                (inv.position_name,),
            )

        # accreditations
        for inv in investigators:
            cur.execute(
                """
                INSERT INTO bio.bio_accreditation (level)
                VALUES (%s)
                ON CONFLICT (level) DO NOTHING
                """,
                (inv.accreditation_level,),
            )

        # investigators (resolve FKs)
        for inv in investigators:
            cur.execute(
                """
                INSERT INTO bio.bio_investigator (name, email, accreditation_id, position_id)
                SELECT %s, %s, a.id, p.id
                  FROM bio.bio_accreditation a
                  JOIN bio.bio_position      p ON p.name = %s
                 WHERE a.level = %s
                ON CONFLICT (email) DO NOTHING
                """,
                (inv.name, inv.email, inv.position_name, inv.accreditation_level),
            )

        # IUCN categories (already seeded by the migration; idempotent)
        for sp in species_list:
            cur.execute(
                """
                INSERT INTO bio.bio_iucn_category (code)
                VALUES (%s)
                ON CONFLICT (code) DO NOTHING
                """,
                (sp.iucn_code,),
            )

        # species
        for sp in species_list:
            cur.execute(
                """
                INSERT INTO bio.bio_species (common_name, scientific_name, iucn_category_id)
                SELECT %s, %s, c.id
                  FROM bio.bio_iucn_category c
                 WHERE c.code = %s
                ON CONFLICT (scientific_name) DO NOTHING
                """,
                (sp.common_name, sp.scientific_name, sp.iucn_code),
            )

        # sites
        for s in sites:
            cur.execute(
                """
                INSERT INTO bio.bio_site (name, region)
                VALUES (%s, %s)
                ON CONFLICT (name, region) DO NOTHING
                """,
                (s.name, s.region),
            )

        # sightings + first note version. Skip annulled ones -- per the brief
        # "los avistamientos deben poder editarse o anularse conservando el
        # registro original", we keep them in bronze but not in silver's
        # active set. The trigger fires on bio_field_note insert and marks
        # embedding_dirty_at, which the worker will resolve later.
        for s in sightings:
            if s.anulado:
                continue
            cur.execute(
                """
                INSERT INTO bio.bio_sighting (
                    obs_ref, investigator_id, species_id, site_id, classification,
                    at_latitude, at_longitude, registered_at, edited_at,
                    embedding_dirty_at
                )
                SELECT
                    %s,
                    i.id,
                    sp.id,
                    si.id,
                    %s,
                    %s, %s,
                    %s::timestamptz,
                    %s::timestamptz,
                    now()
                  FROM bio.bio_investigator i
                  JOIN bio.bio_species      sp ON sp.scientific_name = %s
                  JOIN bio.bio_site         si ON si.name = %s AND si.region = %s
                 WHERE i.email = %s
                ON CONFLICT (obs_ref) DO NOTHING
                """,
                (
                    s.obs_ref,
                    s.classification,
                    s.latitude, s.longitude,
                    s.registered_at, s.edited_at,
                    s.species_scientific_name,
                    s.site_name, s.site_region,
                    s.investigator_email,
                ),
            )
            cur.execute(
                """
                INSERT INTO bio.bio_field_note (sighting_id, version, body)
                SELECT id, 1, %s
                  FROM bio.bio_sighting
                 WHERE obs_ref = %s
                ON CONFLICT (sighting_id, version) DO NOTHING
                """,
                (s.note_body, s.obs_ref),
            )

    conn.commit()


# ----- auth credentials (dev) ----------------------------------------------


def _dev_password_for(investigator_id: int) -> str:
    """Deterministic per-investigator password; safe only for local dev.

    The format is ``Bio-{investigator_id}``. Re-running the seed re-syncs
    the hash so the local credentials are stable.
    """
    return f"Bio-{investigator_id}"


def upsert_auth_credentials(
    conn: psycopg.Connection,
    hasher: _Argon2PasswordHasher,
) -> list[tuple[str, str]]:
    """Upsert one bio_auth_credential row per investigator.

    Returns a list of ``(email, dev_password)`` so the caller can print it.
    """

    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, email FROM bio.bio_investigator ORDER BY id"
        )
        rows = cur.fetchall()

    credentials: list[tuple[str, str]] = []
    with conn.cursor() as cur:
        for investigator_id, email in rows:
            password = _dev_password_for(investigator_id)
            password_hash = hasher.hash(password)
            cur.execute(
                """
                INSERT INTO bio.bio_auth_credential
                    (investigator_id, password_hash, updated_at)
                VALUES (%s, %s, now())
                ON CONFLICT (investigator_id) DO UPDATE
                    SET password_hash = EXCLUDED.password_hash,
                        updated_at    = EXCLUDED.updated_at
                """,
                (investigator_id, password_hash),
            )
            credentials.append((email, password))
    conn.commit()
    return credentials


# ----- main ------------------------------------------------------------------


def main() -> int:
    if not SEED_JSON_PATH.exists():
        print(f"seed file not found: {SEED_JSON_PATH}", file=sys.stderr)
        return 2

    with SEED_JSON_PATH.open(encoding="utf-8") as f:
        payload = json.load(f)

    raw_rows = payload.get("avistamientos", [])
    investigators, species_list, sites, sightings = parse_seed(payload)

    print(
        f"parsed {len(raw_rows)} raw rows -> "
        f"{len(investigators)} investigators, "
        f"{len(species_list)} species, "
        f"{len(sites)} sites, "
        f"{len(sightings)} sightings"
    )

    # argon2id hasher for the dev auth_credentials.
    hasher = _Argon2PasswordHasher(time_cost=3, memory_cost=65536, parallelism=1)

    with psycopg.connect(DATABASE_URL, autocommit=False) as conn:
        ensure_bronze_table(conn)
        n_bronze = load_bronze(conn, raw_rows)
        load_silver(conn, investigators, species_list, sites, sightings)
        credentials = upsert_auth_credentials(conn, hasher)

    print(f"bronze: {n_bronze} rows; silver: load committed.")
    print()
    print("dev auth credentials (email -> password):")
    for email, password in credentials:
        print(f"  {email:<32}  {password}")
    print()
    print("WARNING: these are deterministic dev passwords; rotate before any non-local use.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
