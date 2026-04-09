
CREATE TABLE IF NOT EXISTS public.revenue_property_rate_master
(
    rate_id integer NOT NULL,
    segment_list_id integer NOT NULL,
    usage_category_id integer NOT NULL,
    property_rate numeric(15,2) NOT NULL,
    unit character varying(50) COLLATE pg_catalog."default",
    segment_no text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    financial_year text COLLATE pg_catalog."default",
    subcategoryid text COLLATE pg_catalog."default",
    CONSTRAINT property_rate_master_pkey PRIMARY KEY (rate_id)
);