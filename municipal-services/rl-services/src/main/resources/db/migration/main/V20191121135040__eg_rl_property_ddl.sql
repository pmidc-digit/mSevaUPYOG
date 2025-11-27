drop table eg_rl_allotment_scheduler;
drop table eg_rl_allotment_clsure;
drop table eg_rl_document;
drop table eg_rl_applicant;
drop table eg_rl_allotment;
-- CREATE EXTENSION IF NOT EXISTS audit_details;
-- SELECT * FROM pg_available_extensions WHERE name = 'hstore';
-- SELECT * FROM pg_extension WHERE extname = 'hstore';
-- audit_details JSONB;
--> allotment table

CREATE TABLE IF NOT EXISTS public.eg_rl_allotment
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    property_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    tenant_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    is_auto_renewal boolean,
    application_status integer,
    status status NOT NULL,
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
    lastmodified_time bigint NOT NULL,
    lastmodified_by character varying(128) COLLATE pg_catalog."default",
    witness_details jsonb,
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
--> owner or applicant table-- Table: public.eg_rl_applicant

-- DROP TABLE IF EXISTS public.eg_rl_applicant;

CREATE TABLE IF NOT EXISTS public.eg_rl_applicant
(
    id character varying(128) COLLATE pg_catalog."default" NOT NULL,
    allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
    is_primary_owner boolean,
    owner_type character varying(256) COLLATE pg_catalog."default" NOT NULL,
    ownership_percentage character varying(128) COLLATE pg_catalog."default",
    relationship character varying(128) COLLATE pg_catalog."default",
    status character varying(128) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    middle_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(256) COLLATE pg_catalog."default" NOT NULL,
    email_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
    mobile_no character varying(256) COLLATE pg_catalog."default" NOT NULL,
    address character varying(256) COLLATE pg_catalog."default" NOT NULL,
    aadhar_card_number character varying(256) COLLATE pg_catalog."default" NOT NULL,
    aadhar_card character varying(256) COLLATE pg_catalog."default",
    pan_card_number character varying(256) COLLATE pg_catalog."default" NOT NULL,
    pan_card character varying(256) COLLATE pg_catalog."default",
    CONSTRAINT pk_eg_rl_applicant PRIMARY KEY (id),
    CONSTRAINT aadhar_eg_rl_applicant UNIQUE (aadhar_card_number, allotment_id),
    CONSTRAINT emailid_eg_rl_applicant UNIQUE (email_id, allotment_id),
    CONSTRAINT mobileno_eg_rl_applicant UNIQUE (mobile_no, allotment_id),
    CONSTRAINT pan_eg_rl_applicant UNIQUE (pan_card_number, allotment_id),
    CONSTRAINT fk_eg_rl_applicant FOREIGN KEY (allotment_id)
        REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.eg_rl_applicant
    OWNER to postgres;
-- Index: idx_eg_rl_applicant_allotment_id

-- DROP INDEX IF EXISTS public.idx_eg_rl_applicant_allotment_id;

CREATE INDEX IF NOT EXISTS idx_eg_rl_applicant_allotment_id
    ON public.eg_rl_applicant USING btree
    (allotment_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
	

--> document table
CREATE TABLE IF NOT EXISTS eg_rl_document (
  id               CHARACTER VARYING (128) NOT NULL,
  allotment_id     CHARACTER VARYING (256) NOT NULL,
  documentType     CHARACTER VARYING (128) NOT NULL,
  documentName     CHARACTER VARYING (128) NOT NULL,
  fileStoreid      CHARACTER VARYING (128) NOT NULL,
  status           CHARACTER VARYING (128) NOT NULL,
  createdBy        CHARACTER VARYING (128) NOT NULL,
  lastModifiedBy   CHARACTER VARYING (128),
  createdTime      BIGINT NOT NULL,
  lastModifiedTime BIGINT, 
CONSTRAINT pk_eg_rl_document_id PRIMARY KEY(id),
CONSTRAINT fk_eg_rl_document FOREIGN KEY (allotment_id) REFERENCES eg_rl_allotment(id)
);
CREATE INDEX IF NOT EXISTS idx_eg_rl_document_tenantid ON eg_rl_document (allotment_id);




-->allotment closure or discontunation table 
CREATE TABLE IF NOT EXISTS eg_rl_allotment_clsure(
 id CHARACTER VARYING(128) NOT NULL,
 allotment_id CHARACTER VARYING(128) NOT NULL,
 status int NOT NULL,

 --> clsure details section
 reason_for_clsure CHARACTER VARYING(128) NOT NULL,
 amount_to_be_refund CHARACTER VARYING(256) NOT NULL,
 amount_to_be_deducted CHARACTER VARYING(256) NOT NULL,
 refund_amount CHARACTER VARYING(256) NOT NULL,
 notes_comments CHARACTER VARYING(256) NOT NULL,
 reference_id CHARACTER VARYING(256) NOT NULL,
 upload_proof CHARACTER VARYING(256) NOT NULL,
 audit_details JSONB NOT NULL,

CONSTRAINT pk_eg_rl_allotment_clsure PRIMARY KEY (id),
CONSTRAINT fk_eg_rl_allotment_clsure FOREIGN KEY (allotment_id) REFERENCES eg_rl_allotment(id),
CONSTRAINT unique_eg_rl_allotment_clsure UNIQUE (allotment_id) 
);



-->allotments_cheduler table 
CREATE TABLE IF NOT EXISTS eg_rl_allotment_scheduler(
 id CHARACTER VARYING(128) NOT NULL,
 allotment_id CHARACTER VARYING(128) NOT NULL,
 status int NOT NULL, --> 1-Active,0-inActive

 --> scheduler details section
 next_cycle CHARACTER VARYING(128) NOT NULL, --> monthly
 next_notification_date CHARACTER VARYING(128) NOT NULL,
 notification_type CHARACTER VARYING(128) NOT NULL, --> 1-sms,2-email,3-both
 notification_status int NOT NULL, --> 1-sent,2-failed,3-pending

 notification_message CHARACTER VARYING(256) NOT NULL,
 payment_link CHARACTER VARYING(256) NOT NULL,
 audit_details JSONB NOT NULL,

CONSTRAINT pk_eg_rl_allotment_scheduler PRIMARY KEY (id),
CONSTRAINT fk_eg_rl_allotment_scheduler FOREIGN KEY (allotment_id) REFERENCES eg_rl_allotment(id),
CONSTRAINT unique_eg_rl_allotment_scheduler UNIQUE (allotment_id) 
);