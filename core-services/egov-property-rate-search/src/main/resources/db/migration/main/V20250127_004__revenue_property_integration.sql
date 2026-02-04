-- Table: public.revenue_property_integration

-- DROP TABLE IF EXISTS public.revenue_property_integration;

CREATE TABLE IF NOT EXISTS public.revenue_property_integration
(
    id uuid NOT NULL,
    propertyid character varying(64) COLLATE pg_catalog."default" NOT NULL,
    tenantid character varying(64) COLLATE pg_catalog."default" NOT NULL,
    districtid character varying(64) COLLATE pg_catalog."default",
    tehsilid character varying(64) COLLATE pg_catalog."default",
    villageid character varying(64) COLLATE pg_catalog."default",
    isurban boolean,
    segmentid character varying(64) COLLATE pg_catalog."default",
    categoryid character varying(64) COLLATE pg_catalog."default",
    subcategoryid character varying(64) COLLATE pg_catalog."default",
    locality character varying(256) COLLATE pg_catalog."default",
   	is_verified boolean DEFAULT false,
    unit character varying(32) COLLATE pg_catalog."default",
    isactive boolean DEFAULT true,
    createdby character varying(64) COLLATE pg_catalog."default",
    lastmodifiedby character varying(64) COLLATE pg_catalog."default",
    createdtime bigint,
    lastmodifiedtime bigint,
    CONSTRAINT revenue_property_integration_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;



CREATE UNIQUE INDEX IF NOT EXISTS idx_rev_prop_int_unique
    ON public.revenue_property_integration USING btree
    (propertyid COLLATE pg_catalog."default" ASC NULLS LAST, tenantid COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;