-- 0004_bio_species.sql — catalog of species + their IUCN category.

CREATE TABLE bio.bio_species (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    common_name      varchar(200) NOT NULL,
    scientific_name  varchar(200) NOT NULL UNIQUE,
    iucn_category_id bigint NOT NULL REFERENCES bio.bio_iucn_category(id),
    count_total      integer CHECK (count_total IS NULL OR count_total >= 0)
);

CREATE INDEX ix_bio_species_common_name
    ON bio.bio_species (lower(common_name));
CREATE INDEX ix_bio_species_iucn
    ON bio.bio_species (iucn_category_id);
