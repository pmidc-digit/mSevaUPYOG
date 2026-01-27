
CREATE TABLE IF NOT EXISTS public.revenue_property_rate_master
(
    rate_id integer NOT NULL DEFAULT nextval('property_rate_master_rate_id_seq'::regclass),
    segment_list_id integer,
    sub_category_id integer,
    property_rate numeric(15,2) NOT NULL,
    unit character varying(50) COLLATE pg_catalog."default",
    segment_no integer,
    is_active boolean DEFAULT true,
    CONSTRAINT property_rate_master_pkey PRIMARY KEY (rate_id),
    CONSTRAINT property_rate_master_segment_list_id_fkey FOREIGN KEY (segment_list_id)
        REFERENCES public.segment_list (segment_list_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT property_rate_master_sub_category_id_fkey FOREIGN KEY (sub_category_id)
        REFERENCES public.sub_category_master (sub_category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;