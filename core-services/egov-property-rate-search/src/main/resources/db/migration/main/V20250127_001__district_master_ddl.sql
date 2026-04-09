
CREATE TABLE IF NOT EXISTS public.revenue_district_master
(
    district_id integer NOT NULL,
    district_name text COLLATE pg_catalog."default" NOT NULL,
    state_id integer,
    tenantid text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT district_tenantid_pkey PRIMARY KEY (tenantid)
);