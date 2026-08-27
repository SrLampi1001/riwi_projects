-- 0003_bio_investigator.sql — people, their accreditation, position, and
-- authentication state.

CREATE TABLE bio.bio_investigator (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    accreditation_id bigint NOT NULL REFERENCES bio.bio_accreditation(id),
    position_id      bigint NOT NULL REFERENCES bio.bio_position(id),
    name             varchar(200) NOT NULL,
    email            varchar(320) NOT NULL UNIQUE
);

CREATE INDEX ix_bio_investigator_email ON bio.bio_investigator (email);

-- Password credentials live in a separate table: one row per investigator,
-- holds the argon2id hash. Plaintext passwords never land in this database.
CREATE TABLE bio.bio_auth_credential (
    investigator_id  bigint PRIMARY KEY REFERENCES bio.bio_investigator(id) ON DELETE CASCADE,
    password_hash    text NOT NULL,
    updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Refresh tokens are stored hashed with a family id so reuse can be detected.
CREATE TABLE bio.bio_refresh_token (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    investigator_id bigint NOT NULL REFERENCES bio.bio_investigator(id) ON DELETE CASCADE,
    token_hash      text NOT NULL UNIQUE,
    family_id       uuid NOT NULL,
    expires_at      timestamptz NOT NULL,
    revoked_at      timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_bio_refresh_token_investigator
    ON bio.bio_refresh_token (investigator_id);
CREATE INDEX ix_bio_refresh_token_family
    ON bio.bio_refresh_token (family_id);

-- Token/cost audit table for the AI copilot; required by §11.4.
CREATE TABLE bio.bio_copilot_usage (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    investigator_id    bigint NOT NULL REFERENCES bio.bio_investigator(id) ON DELETE CASCADE,
    model              varchar(120) NOT NULL,
    prompt_tokens      integer NOT NULL CHECK (prompt_tokens >= 0),
    completion_tokens  integer NOT NULL CHECK (completion_tokens >= 0),
    cost_usd           numeric(10,6),
    created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_bio_copilot_usage_investigator_created_at
    ON bio.bio_copilot_usage (investigator_id, created_at DESC);
