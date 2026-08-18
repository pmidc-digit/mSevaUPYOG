CREATE TABLE IF NOT EXISTS eg_rl_rent_revision (
    id character varying(128) NOT NULL,
    allotment_id character varying(128) NOT NULL,
    revised_rent numeric(12,2) NOT NULL,
    revision_date bigint NOT NULL,
    next_revision_date bigint NOT NULL,
    increment_percentage numeric(5,2),
    tenant_id character varying(128) NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_time bigint NOT NULL,
    created_by character varying(128) NOT NULL,
    lastmodified_time bigint,
    lastmodified_by character varying(128),
    CONSTRAINT pk_eg_rl_rent_revision PRIMARY KEY (id),
    CONSTRAINT fk_eg_rl_rent_revision_allotment FOREIGN KEY (allotment_id)
        REFERENCES eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
