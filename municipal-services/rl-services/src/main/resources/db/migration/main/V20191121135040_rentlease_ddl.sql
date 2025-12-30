-- drop table eg_rl_allotment_scheduler;
-- drop table eg_rl_allotment_clsure;
-- drop table eg_rl_document;
-- drop table eg_rl_owner_info;
-- drop table eg_rl_allotment;-- Table: public.eg_rl_allotment

-- DROP TABLE IF EXISTS public.eg_rl_allotment;

CREATE TABLE IF NOT EXISTS public.eg_rl_allotment
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    property_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    tenant_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    application_type character varying(128) COLLATE pg_catalog."default" NOT NULL,
    application_number character varying(128) COLLATE pg_catalog."default" NOT NULL,
    previous_application_number character varying(128) COLLATE pg_catalog."default",
    start_date bigint NOT NULL,
    end_date bigint NOT NULL,
    expireflag boolean DEFAULT false,
    is_gst_applicable boolean DEFAULT true,
    is_cow_cess_applicable boolean DEFAULT true,
    is_refund_applicable_on_discontinuation boolean DEFAULT true,
    penalty_type character varying(128) COLLATE pg_catalog."default",
    created_time bigint NOT NULL,
    created_by character varying(128) COLLATE pg_catalog."default" NOT NULL,
    lastmodified_time bigint,
    lastmodified_by character varying(128) COLLATE pg_catalog."default",
    additional_details jsonb,
    term_and_condition character varying(255) COLLATE pg_catalog."default",
    reason_for_closure character varying(255) COLLATE pg_catalog."default",
    notes_comments character varying(255) COLLATE pg_catalog."default",
    trade_license_number character varying(100) COLLATE pg_catalog."default",
    registration_number character varying(100) COLLATE pg_catalog."default",
    amount_tobe_deducted numeric(12,2) DEFAULT 0,
    amount_to_be_refund numeric(12,2) DEFAULT 0,
    CONSTRAINT pk_eg_rl_allotment PRIMARY KEY (id),
    CONSTRAINT eg_rl_allotment_application_number_key UNIQUE (application_number),
    CONSTRAINT unique_entry_eg_rl_applicant UNIQUE (property_id, tenant_id, previous_application_number)
)

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
    owner_type character varying(256) COLLATE pg_catalog."default",
    ownership_percentage character varying(128) COLLATE pg_catalog."default",
    relationship character varying(128) COLLATE pg_catalog."default",
    status character varying(128) COLLATE pg_catalog."default",
    CONSTRAINT pk_eg_rl_owner_info PRIMARY KEY (id),
    CONSTRAINT fk_eg_rl_allotment FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

-- DROP INDEX IF EXISTS public.idx_eg_rl_owner_info_allotment_id;

CREATE INDEX IF NOT EXISTS idx_eg_rl_owner_info_allotment_id
    ON public.eg_rl_owner_info USING btree
    (allotment_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_eg_rl_owner_info_user_uuid

-- DROP INDEX IF EXISTS public.idx_eg_rl_owner_info_user_uuid;

CREATE INDEX IF NOT EXISTS idx_eg_rl_owner_info_user_uuid
    ON public.eg_rl_owner_info USING btree
    (user_uuid COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

    -- Table: public.eg_rl_document

-- DROP TABLE IF EXISTS public.eg_rl_document;

CREATE TABLE IF NOT EXISTS public.eg_rl_document
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
    documenttype character varying(128) COLLATE pg_catalog."default" NOT NULL,
    filestoreid character varying(128) COLLATE pg_catalog."default" NOT NULL,
    status character varying(128) COLLATE pg_catalog."default",
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

-- DROP INDEX IF EXISTS public.idx_eg_rl_document_tenantid;

CREATE INDEX IF NOT EXISTS idx_eg_rl_document_tenantid
    ON public.eg_rl_document USING btree
    (allotment_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
