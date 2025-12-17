
-- Add columns
ALTER TABLE eg_rl_allotment
    ADD COLUMN reason_for_closure        VARCHAR(255),               -- short reason text
    ADD COLUMN amount_tobe_deducted      bigint,    -- monetary value
    ADD COLUMN notes_comments            VARCHAR(255),                        -- longer free text
    ADD COLUMN amount_to_be_refund       bigint;     -- if you want to keep the optional field

--delete from eg_rl_allotment_scheduler;
--delete from eg_rl_allotment_clsure;
--delete from eg_rl_document;
--delete from eg_rl_owner_info;
--delete from eg_rl_allotment;

--drop table eg_rl_allotment_scheduler;
--drop table eg_rl_allotment_clsure;
--drop table eg_rl_document;
--drop table eg_rl_owner_info;
--drop table eg_rl_allotment;
-- CREATE EXTENSION IF NOT EXISTS audit_details;
-- SELECT * FROM pg_available_extensions WHERE name = 'hstore';
-- SELECT * FROM pg_extension WHERE extname = 'hstore';
-- audit_details JSONB;
--> allotment table
-- CREATE TABLE IF NOT EXISTS public.eg_rl_allotment
-- (
--     id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     property_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     tenant_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     status character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     application_type character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     application_number character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     previous_application_number character varying(128) COLLATE pg_catalog."default",
--     start_date bigint NOT NULL,
--     end_date bigint NOT NULL,
--     expireflag boolean DEFAULT false,
-- 	is_gst_applicable boolean DEFAULT true,
-- 	is_cow_cess_applicable boolean DEFAULT true,
--     is_refund_applicable_on_discontinuation boolean DEFAULT true,
-- 	penalty_type character varying(128) COLLATE pg_catalog."default",
-- 	term_and_condition character varying(256) COLLATE pg_catalog."default",
--     created_time bigint NOT NULL,
--     created_by character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     lastmodified_time bigint,
--     lastmodified_by character varying(128) COLLATE pg_catalog."default",
--     additional_details jsonb,
--     CONSTRAINT pk_eg_rl_allotment PRIMARY KEY (id),
--     CONSTRAINT eg_rl_allotment_application_number_key UNIQUE (application_number)
-- );

-- CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_tenant_id ON eg_rl_allotment(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_property_id ON eg_rl_allotment(property_id);
-- CREATE INDEX IF NOT EXISTS idx_eg_rl_allotment_start_end_date ON eg_rl_allotment(start_date, end_date);


-- --> owner or applicant table
-- CREATE TABLE IF NOT EXISTS public.eg_rl_owner_info
-- (
--     id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     user_uuid character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     is_primary_owner boolean,
--     owner_type character varying(256),
--     ownership_percentage character varying(128) ,
--     relationship character varying(128) ,
--     status character varying(128) ,
--     CONSTRAINT pk_eg_rl_owner_info PRIMARY KEY (id),
--     CONSTRAINT fk_eg_rl_allotment FOREIGN KEY (allotment_id)
--         REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
--         ON UPDATE NO ACTION
--         ON DELETE NO ACTION
-- );
-- CREATE INDEX IF NOT EXISTS idx_eg_rl_owner_info_user_uuid ON eg_rl_owner_info (user_uuid);
-- CREATE INDEX IF NOT EXISTS idx_eg_rl_owner_info_allotment_id ON eg_rl_owner_info (allotment_id);


-- --> document table
-- CREATE TABLE IF NOT EXISTS public.eg_rl_document
-- (
--     id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     allotment_id character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     documenttype character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     filestoreid character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     status character varying(128) ,
--     createdby character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     lastmodifiedby character varying(128),
--     createdtime bigint NOT NULL,
--     lastmodifiedtime bigint,
--     CONSTRAINT pk_eg_rl_document_id PRIMARY KEY (id),
--     CONSTRAINT fk_eg_rl_document FOREIGN KEY (allotment_id)
--         REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
--         ON UPDATE NO ACTION
--         ON DELETE NO ACTION
-- );
-- CREATE INDEX IF NOT EXISTS idx_eg_rl_document_tenantid ON eg_rl_document (allotment_id);




-->allotment closure or discontunation table 
-- CREATE TABLE IF NOT EXISTS public.eg_rl_allotment_clsure
-- (
--     id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     allotment_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
-- 	tenant_id character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     status character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     application_number character varying(128) COLLATE pg_catalog."default" NOT NULL,
-- 	alloted_application_number character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     reason_for_clsure character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     amount_to_be_refund character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     amount_to_be_deducted character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     refund_amount character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     notes_comments character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     upload_proof character varying(256) COLLATE pg_catalog."default" NOT NULL,
--     created_time bigint NOT NULL,
--     created_by character varying(128) COLLATE pg_catalog."default" NOT NULL,
--     lastmodified_time bigint,
--     lastmodified_by character varying(128) COLLATE pg_catalog."default",
--     CONSTRAINT pk_eg_rl_allotment_clsure PRIMARY KEY (id),
--     CONSTRAINT unique_eg_rl_allotment_clsure UNIQUE (allotment_id),
-- 	CONSTRAINT unique_eg_rl_alloted_application_number UNIQUE (alloted_application_number),
--     CONSTRAINT fk_eg_rl_allotment_clsure FOREIGN KEY (allotment_id)
--         REFERENCES public.eg_rl_allotment (id) MATCH SIMPLE
--         ON UPDATE NO ACTION
--         ON DELETE NO ACTION
-- );



-->allotments_cheduler table 
--CREATE TABLE IF NOT EXISTS eg_rl_allotment_scheduler(
-- id CHARACTER VARYING(128) NOT NULL,
-- allotment_id CHARACTER VARYING(128) NOT NULL,
-- application_number CHARACTER VARYING(128) NOT NULL,
-- tenant_id CHARACTER VARYING(128) NOT NULL,
-- status int NOT NULL, --> 1-Active,0-inActive
-- payment_success_id CHARACTER VARYING(128),
-- demand_id CHARACTER VARYING(128) NOT NULL,
--
-- --> scheduler details section
-- current_notification_date bigint NOT NULL,
-- next_cycle CHARACTER VARYING(128) NOT NULL, --> monthly
-- next_notification_date CHARACTER VARYING(128) NOT NULL,
-- notification_type CHARACTER VARYING(128) NOT NULL, --> 1-sms,2-email,3-both
-- notification_status int NOT NULL, --> 1-sent,2-failed,3-pending
-- notification_count_for_current_cycle int NOT NULL,
--
-- notification_message CHARACTER VARYING(256) NOT NULL,
-- payment_link CHARACTER VARYING(256) NOT NULL,
-- created_time bigint NOT NULL,
-- created_by character varying(128)  NOT NULL,
-- lastmodified_time bigint,
-- lastmodified_by character varying(128),
--
--CONSTRAINT pk_eg_rl_allotment_scheduler PRIMARY KEY (id),
--CONSTRAINT fk_eg_rl_allotment_scheduler FOREIGN KEY (allotment_id) REFERENCES eg_rl_allotment(id)
--);
