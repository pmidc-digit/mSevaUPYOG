CREATE TABLE IF NOT EXISTS public.revenue_property_rate_master
(
    rate_id integer NOT NULL,
    segment_list_id integer,
    sub_category_id integer,
    property_rate numeric(15,2) NOT NULL,
    unit character varying(50),
    segment_no integer,
    is_active boolean DEFAULT true,
    CONSTRAINT property_rate_master_pkey PRIMARY KEY (rate_id)
);
