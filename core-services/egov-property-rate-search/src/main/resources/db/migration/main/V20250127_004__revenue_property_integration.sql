-- Table: public.revenue_property_integration

-- DROP TABLE IF EXISTS public.revenue_property_integration;

CREATE TABLE IF NOT EXISTS public.revenue_property_integration
(
    id uuid NOT NULL,
    propertyid character varying(64) COLLATE pg_catalog."default",
    tenantid character varying(64) COLLATE pg_catalog."default" NOT NULL,
    districtid character varying(64) COLLATE pg_catalog."default",
    tehsilid character varying(64) COLLATE pg_catalog."default",
    village_id character varying(64) COLLATE pg_catalog."default",
    isurban boolean,
    segmentid character varying(64) COLLATE pg_catalog."default",
    subsegmentid character varying(64) COLLATE pg_catalog."default",
    categoryid character varying(64) COLLATE pg_catalog."default",
    subcategoryid character varying(64) COLLATE pg_catalog."default",
    locality character varying(256) COLLATE pg_catalog."default",
    rate numeric(14,2),
    unit character varying(32) COLLATE pg_catalog."default",
    is_verified boolean DEFAULT false,
    createdby character varying(64) COLLATE pg_catalog."default",
    lastmodifiedby character varying(64) COLLATE pg_catalog."default",
    createdtime bigint,
    lastmodifiedtime bigint,
    CONSTRAINT revenue_property_integration_pikey PRIMARY KEY (id)
);