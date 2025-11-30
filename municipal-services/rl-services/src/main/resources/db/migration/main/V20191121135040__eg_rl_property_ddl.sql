drop table eg_rl_allotment_scheduler;
drop table eg_rl_allotment_clsure;
drop table eg_rl_document;
drop table eg_rl_owner_info;
drop table eg_rl_allotment;
-- CREATE EXTENSION IF NOT EXISTS audit_details;
-- SELECT * FROM pg_available_extensions WHERE name = 'hstore';
-- SELECT * FROM pg_extension WHERE extname = 'hstore';
-- audit_details JSONB;
--> allotment table

-- Table: public.eg_rl_allotment

-- DROP TABLE IF EXISTS public.eg_rl_allotment;

CREATE TABLE IF NOT EXISTS public.eg_rl_allotment
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    property_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    tenant_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    is_auto_renewal boolean,
    expireflag boolean DEFAULT false,
    application_status integer,
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    application_type character varying(128) COLLATE pg_catalog."default" NOT NULL,
    application_number character varying(128) COLLATE pg_catalog."default" NOT NULL,
    previous_application_number character varying(128) COLLATE pg_catalog."default",
    start_date bigint NOT NULL,
    end_date bigint NOT NULL,
    last_payment_percantage character varying(128) COLLATE pg_catalog."default",
    term_and_condition character varying(256) COLLATE pg_catalog."default" NOT NULL,
    penalty_type character varying(128) COLLATE pg_catalog."default",
    created_time bigint NOT NULL,
    created_by character varying(128) COLLATE pg_catalog."default" NOT NULL,
    lastmodified_time bigint,
    lastmodified_by character varying(128) COLLATE pg_catalog."default",
    additional_details jsonb,
    CONSTRAINT pk_eg_rl_allotment PRIMARY KEY (id),
    CONSTRAINT eg_rl_allotment_application_number_key UNIQUE (application_number)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_allotment
    OWNER to postgres;
-- Index: idx_eg_rl_allotment_property_id

-- DROP INDEX IF EXISTS public.idx_eg_rl_allotment_property_id;

CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_property_id
    ON public.eg_rl_allotment USING btree
    (property_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_eg_rl_allotment_start_end_date

-- DROP INDEX IF EXISTS public.idx_eg_rl_allotment_start_end_date;

CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_start_end_date
    ON public.eg_rl_allotment USING btree
    (start_date ASC NULLS LAST, end_date ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_eg_rl_allotment_tenant_id

-- DROP INDEX IF EXISTS public.idx_eg_rl_allotment_tenant_id;

CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_tenant_id
    ON public.eg_rl_allotment USING btree
    (tenant_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    
    -- Table: public.eg_rl_owner_info

-- DROP TABLE IF EXISTS public.eg_rl_owner_info;

CREATE TABLE IF NOT EXISTS public.eg_rl_owner_info
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
    user_uuid character varying(256) COLLATE pg_catalog."default" NOT NULL,
    is_primary_owner boolean,
    owner_type character varying(256) COLLATE pg_catalog."default" NOT NULL,
    ownership_percentage character varying(128) COLLATE pg_catalog."default",
    relationship character varying(128) COLLATE pg_catalog."default",
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT pk_eg_rl_owner_info PRIMARY KEY (id),
    CONSTRAINT fk_eg_rl_allotment FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_owner_info
    OWNER to postgres;
    
    -- Table: public.eg_rl_document

-- DROP TABLE IF EXISTS public.eg_rl_document;

CREATE TABLE IF NOT EXISTS public.eg_rl_document
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
    documenttype character varying(128) COLLATE pg_catalog."default" NOT NULL,
    filestoreid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    createdby character varying(128) COLLATE pg_catalog."default" NOT NULL,
    lastmodifiedby character varying(128) COLLATE pg_catalog."default",
    createdtime bigint NOT NULL,
    lastmodifiedtime bigint,
    CONSTRAINT pk_eg_rl_document_id PRIMARY KEY (id),
    CONSTRAINT fk_eg_rl_document FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_document
    OWNER to postgres;
-- Index: idx_eg_rl_document_tenantid

-- DROP INDEX IF EXISTS public.idx_eg_rl_document_tenantid;

CREATE INDEX IF NOT EXISTS idx_eg_rl_document_tenantid
    ON public.eg_rl_document USING btree
    (allotment_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    
    -- Table: public.eg_rl_allotment_clsure

-- DROP TABLE IF EXISTS public.eg_rl_allotment_clsure;

CREATE TABLE IF NOT EXISTS public.eg_rl_allotment_clsure
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    reason_for_clsure character varying(128) COLLATE pg_catalog."default" NOT NULL,
    amount_to_be_refund character varying(256) COLLATE pg_catalog."default" NOT NULL,
    amount_to_be_deducted character varying(256) COLLATE pg_catalog."default" NOT NULL,
    refund_amount character varying(256) COLLATE pg_catalog."default" NOT NULL,
    notes_comments character varying(256) COLLATE pg_catalog."default" NOT NULL,
    upload_proof character varying(256) COLLATE pg_catalog."default" NOT NULL,
    audit_details jsonb NOT NULL,
    CONSTRAINT pk_eg_rl_allotment_clsure PRIMARY KEY (id),
    CONSTRAINT unique_eg_rl_allotment_clsure UNIQUE (allotment_id),
    CONSTRAINT fk_eg_rl_allotment_clsure FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_allotment_clsure
    OWNER to postgres;
    
    -- Table: public.eg_rl_allotment_scheduler

-- DROP TABLE IF EXISTS public.eg_rl_allotment_scheduler;

CREATE TABLE IF NOT EXISTS public.eg_rl_allotment_scheduler
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    status integer NOT NULL,
    next_cycle character varying(128) COLLATE pg_catalog."default" NOT NULL,
    next_notification_date character varying(128) COLLATE pg_catalog."default" NOT NULL,
    notification_type character varying(128) COLLATE pg_catalog."default" NOT NULL,
    notification_status integer NOT NULL,
    notification_message character varying(256) COLLATE pg_catalog."default" NOT NULL,
    payment_link character varying(256) COLLATE pg_catalog."default" NOT NULL,
    audit_details jsonb NOT NULL,
    CONSTRAINT pk_eg_rl_allotment_scheduler PRIMARY KEY (id),
    CONSTRAINT unique_eg_rl_allotment_scheduler UNIQUE (allotment_id),
    CONSTRAINT fk_eg_rl_allotment_scheduler FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_allotment_scheduler
    OWNER to postgres;