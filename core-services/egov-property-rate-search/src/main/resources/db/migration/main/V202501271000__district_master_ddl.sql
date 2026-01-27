
CREATE TABLE IF NOT EXISTS public.revenue_district_master
(
    district_id integer NOT NULL DEFAULT nextval('district_master_district_id_seq'::regclass),
    district_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT district_master_pkey PRIMARY KEY (district_id),
    CONSTRAINT district_master_district_name_key UNIQUE (district_name),
    CONSTRAINT uk_district_name UNIQUE (district_name)
)

TABLESPACE pg_default;