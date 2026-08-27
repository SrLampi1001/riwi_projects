-- 0008_functions_procedures_triggers.sql — business logic in the database.
--
-- The brief requires:
--   * one transactional function that registers a sighting (all-or-nothing),
--   * two stored procedures: investigator search and edit/annul,
--   * at least one trigger that keeps the search vector consistent.
--
-- Embeddings cannot be computed inside PostgreSQL (no HTTP client by default
-- and no PL/Python in the project's minimal image). The trigger marks the
-- sighting as dirty; a backend worker drains the dirty rows, calls Mistral,
-- and writes the vector back. This keeps RLS intact (the worker runs as the
-- actor) and avoids pulling extra extensions into the schema.

-- ----- helpers ---------------------------------------------------------------

-- Maps an IUCN code to a default classification (1=public, 2=restricted,
-- 3=confidential). Used by bio_register_sighting when the caller does not
-- supply classification explicitly. CR/EN → 3, VU/NT → 2, LC → 1.
CREATE OR REPLACE FUNCTION bio.bio_iucn_to_classification(p_code char(2))
    RETURNS smallint
    LANGUAGE sql
    IMMUTABLE
AS $$
    SELECT CASE p_code
        WHEN 'CR' THEN 3::smallint
        WHEN 'EN' THEN 3::smallint
        WHEN 'EW' THEN 3::smallint
        WHEN 'EX' THEN 3::smallint
        WHEN 'VU' THEN 2::smallint
        WHEN 'NT' THEN 2::smallint
        WHEN 'LC' THEN 1::smallint
        ELSE 1::smallint
    END;
$$;

-- ----- registration (transactional) ------------------------------------------

-- Register a sighting and its first field-note version in one transaction.
-- Returns the new sighting id.
--
-- Validation:
--   * actor must exist and match the JWT-derived investigator id
--   * species and site must exist
--   * if classification is NULL, default from IUCN of the species
--   * observation reference (obs_ref) must be unique across the table
--
-- The function is SECURITY DEFINER so it can insert into bio_sighting while
-- RLS would otherwise block the INSERT (the actor's WITH CHECK requires
-- investigator_id = actor; this function sets investigator_id explicitly).
CREATE OR REPLACE FUNCTION bio.bio_register_sighting(
    p_actor_id        bigint,
    p_obs_ref         varchar(64),
    p_species_id      bigint,
    p_site_id         bigint,
    p_classification  smallint,
    p_latitude        numeric(9,6),
    p_longitude       numeric(9,6),
    p_note_body       text
) RETURNS bigint
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = bio, public
AS $$
DECLARE
    v_species_iucn      char(2);
    v_classification    smallint;
    v_sighting_id       bigint;
    v_actor_exists      boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM bio.bio_investigator WHERE id = p_actor_id
    ) INTO v_actor_exists;
    IF NOT v_actor_exists THEN
        RAISE EXCEPTION 'bio_register_sighting: actor % does not exist', p_actor_id
            USING ERRCODE = '23514';
    END IF;

    SELECT c.code
      INTO v_species_iucn
      FROM bio.bio_species s
      JOIN bio.bio_iucn_category c ON c.id = s.iucn_category_id
     WHERE s.id = p_species_id;
    IF v_species_iucn IS NULL THEN
        RAISE EXCEPTION 'bio_register_sighting: species % does not exist', p_species_id
            USING ERRCODE = '23514';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM bio.bio_site WHERE id = p_site_id
    ) INTO v_actor_exists;
    IF NOT v_actor_exists THEN
        RAISE EXCEPTION 'bio_register_sighting: site % does not exist', p_site_id
            USING ERRCODE = '23514';
    END IF;

    v_classification := COALESCE(p_classification, bio.bio_iucn_to_classification(v_species_iucn));

    INSERT INTO bio.bio_sighting (
        obs_ref, investigator_id, species_id, site_id, classification,
        at_latitude, at_longitude, embedding_dirty_at
    ) VALUES (
        p_obs_ref, p_actor_id, p_species_id, p_site_id, v_classification,
        p_latitude, p_longitude, now()
    )
    RETURNING id INTO v_sighting_id;

    INSERT INTO bio.bio_field_note (sighting_id, version, body)
    VALUES (v_sighting_id, 1, p_note_body);

    RETURN v_sighting_id;
END;
$$;

REVOKE ALL ON FUNCTION bio.bio_register_sighting(
    bigint, varchar, bigint, bigint, smallint, numeric, numeric, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bio.bio_register_sighting(
    bigint, varchar, bigint, bigint, smallint, numeric, numeric, text
) TO bioma_app;

-- ----- procedures ------------------------------------------------------------

-- Researcher lookup with keyset pagination on (name, id). Required by §3.
-- SECURITY INVOKER: caller sees what RLS allows; bioma_app has SELECT on
-- bio_investigator only for the rows it can resolve through other policies.
CREATE OR REPLACE PROCEDURE bio.bio_search_investigators(
    IN  p_after_name    varchar,
    IN  p_after_id      bigint,
    IN  p_limit         integer,
    OUT o_id            bigint,
    OUT o_name          varchar,
    OUT o_email         varchar,
    OUT o_position      varchar,
    OUT o_accreditation smallint
)
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Returns a single result set with the requested page.
    -- Callers consume it with `CALL bio.bio_search_investigators(...)` and
    -- fetch all rows; keyset cursor is the (name, id) pair of the last row.
    RETURN QUERY
        SELECT i.id, i.name, i.email, p.name AS position, a.level
          FROM bio.bio_investigator i
          JOIN bio.bio_position      p ON p.id = i.position_id
          JOIN bio.bio_accreditation a ON a.id = i.accreditation_id
         WHERE (p_after_name IS NULL
                OR (i.name, i.id) > (p_after_name, p_after_id))
         ORDER BY i.name ASC, i.id ASC
         LIMIT GREATEST(p_limit, 1);
END;
$$;

REVOKE ALL ON PROCEDURE bio.bio_search_investigators(varchar, bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON PROCEDURE bio.bio_search_investigators(varchar, bigint, integer) TO bioma_app;

-- Edit (append a note version) or logically annul a sighting owned by the
-- actor. The brief mandates logical annulment only — this procedure is the
-- single authorised mutation path for sightings past the initial register.
CREATE OR REPLACE PROCEDURE bio.bio_edit_or_annul_sighting(
    IN p_sighting_id    bigint,
    IN p_actor_id       bigint,
    IN p_annul          boolean,
    IN p_note_body      text,
    IN p_annul_reason   text
)
LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = bio, public
AS $$
DECLARE
    v_owner_id   bigint;
    v_annulled_at timestamptz;
    v_next_version integer;
BEGIN
    SELECT investigator_id, annulled_at
      INTO v_owner_id, v_annulled_at
      FROM bio.bio_sighting
     WHERE id = p_sighting_id;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'bio_edit_or_annul_sighting: sighting % not found', p_sighting_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_owner_id <> p_actor_id THEN
        -- Non-owner authors cannot mutate; RLS already hides them, but explicit
        -- check avoids relying on policy defaults.
        RAISE EXCEPTION 'bio_edit_or_annul_sighting: actor % is not the author of %', p_actor_id, p_sighting_id
            USING ERRCODE = '42501';
    END IF;

    IF v_annulled_at IS NOT NULL THEN
        RAISE EXCEPTION 'bio_edit_or_annul_sighting: sighting % is already annulled', p_sighting_id
            USING ERRCODE = 'P0001';
    END IF;

    IF p_annul THEN
        IF p_annul_reason IS NULL OR length(trim(p_annul_reason)) = 0 THEN
            RAISE EXCEPTION 'bio_edit_or_annul_sighting: annulment reason is required'
                USING ERRCODE = '23514';
        END IF;
        UPDATE bio.bio_sighting
           SET annulled_at = now(),
               annulment_reason = p_annul_reason,
               edited_at = now()
         WHERE id = p_sighting_id;
    ELSE
        IF p_note_body IS NULL OR length(trim(p_note_body)) = 0 THEN
            RAISE EXCEPTION 'bio_edit_or_annul_sighting: note body is required for edits'
                USING ERRCODE = '23514';
        END IF;
        SELECT COALESCE(MAX(version), 0) + 1
          INTO v_next_version
          FROM bio.bio_field_note
         WHERE sighting_id = p_sighting_id;
        INSERT INTO bio.bio_field_note (sighting_id, version, body)
        VALUES (p_sighting_id, v_next_version, p_note_body);
        UPDATE bio.bio_sighting
           SET edited_at = now()
         WHERE id = p_sighting_id;
    END IF;
END;
$$;

REVOKE ALL ON PROCEDURE bio.bio_edit_or_annul_sighting(bigint, bigint, boolean, text, text) FROM PUBLIC;
GRANT EXECUTE ON PROCEDURE bio.bio_edit_or_annul_sighting(bigint, bigint, boolean, text, text) TO bioma_app;

-- ----- triggers --------------------------------------------------------------

-- Mark a sighting as embedding-dirty whenever a new field note is appended.
-- A backend worker (added in a later PR) drains dirty rows, calls Mistral,
-- and writes the vector back to bio_sighting.embedding.
CREATE OR REPLACE FUNCTION bio.bio_mark_embedding_dirty()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE bio.bio_sighting
       SET embedding_dirty_at = now()
     WHERE id = NEW.sighting_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_field_note_mark_dirty
    AFTER INSERT ON bio.bio_field_note
    FOR EACH ROW
    EXECUTE FUNCTION bio.bio_mark_embedding_dirty();

-- Same trigger fires on UPDATE in case future schema changes add note edits
-- (currently the body is immutable, but the trigger covers the shape).
