-- 0005_bio_site.sql — places where sightings happen. Heavy repetition in the
-- seed corpus justifies keeping site as its own entity so sightings can be
-- aggregated per site (brief §11.1) and 1FN → 3FN normalisation is honest.

CREATE TABLE bio.bio_site (
    id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    varchar(200) NOT NULL,
    region  varchar(120) NOT NULL,
    UNIQUE (name, region)
);

CREATE INDEX ix_bio_site_region ON bio.bio_site (region);
