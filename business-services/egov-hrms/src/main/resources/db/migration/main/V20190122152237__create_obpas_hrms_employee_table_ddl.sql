
CREATE TABLE IF NOT EXISTS public.eg_hrms_obpass_employee
(
    uuid uuid NOT NULL DEFAULT gen_random_uuid(),
    tenantid character varying(64) COLLATE pg_catalog."default" NOT NULL,
    userid character varying(64) COLLATE pg_catalog."default" NOT NULL,
    category character varying(64) COLLATE pg_catalog."default",
    subcategory character varying(64) COLLATE pg_catalog."default",
    zone character varying(64) COLLATE pg_catalog."default",
    assigned_tenantid character varying(64) COLLATE pg_catalog."default",
    createdby character varying(64) COLLATE pg_catalog."default",
    createddate bigint,
    lastmodifiedby character varying(64) COLLATE pg_catalog."default",
    lastmodifieddate bigint,
    CONSTRAINT eg_hrms_obpass_employee_pkey PRIMARY KEY (uuid)
)
