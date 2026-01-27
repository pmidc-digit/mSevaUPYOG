-- Table: public.revenue_segment_list

-- DROP TABLE IF EXISTS public.revenue_segment_list;

CREATE TABLE IF NOT EXISTS public.revenue_segment_list
(
    segment_list_id integer NOT NULL DEFAULT nextval('segment_list_segment_list_id_seq'::regclass),
    segment_list_name text COLLATE pg_catalog."default" NOT NULL,
    segment_level_id integer NOT NULL,
    CONSTRAINT segment_list_pkey PRIMARY KEY (segment_list_id),
    CONSTRAINT uk_segment_list_name UNIQUE (segment_list_name, segment_level_id),
    CONSTRAINT fk_segment_level FOREIGN KEY (segment_level_id)
        REFERENCES public.segment_master (segment_level_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;


CREATE TABLE IF NOT EXISTS public.revenue_segment_master
(
    segment_level_id integer NOT NULL DEFAULT nextval('segment_master_segment_level_id_seq'::regclass),
    segment_name text COLLATE pg_catalog."default" NOT NULL,
    village_id integer NOT NULL,
    CONSTRAINT segment_master_pkey PRIMARY KEY (segment_level_id),
    CONSTRAINT uk_segment_village UNIQUE (segment_name, village_id),
    CONSTRAINT fk_village FOREIGN KEY (village_id)
        REFERENCES public.village_master (village_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.revenue_sub_category_master
(
    sub_category_id integer NOT NULL DEFAULT nextval('sub_category_master_sub_category_id_seq'::regclass),
    sub_category_name text COLLATE pg_catalog."default" NOT NULL,
    usage_category_id integer NOT NULL,
    CONSTRAINT sub_category_master_pkey PRIMARY KEY (sub_category_id),
    CONSTRAINT uk_sub_category_name UNIQUE (sub_category_name),
    CONSTRAINT fk_usage_category FOREIGN KEY (usage_category_id)
        REFERENCES public.usage_category_master (usage_category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.revenue_tehsil_master
(
    tehsil_id integer NOT NULL DEFAULT nextval('tehsil_master_tehsil_id_seq'::regclass),
    tehsil_name text COLLATE pg_catalog."default" NOT NULL,
    district_id integer NOT NULL,
    CONSTRAINT tehsil_master_pkey PRIMARY KEY (tehsil_id),
    CONSTRAINT uk_tehsil_name UNIQUE (tehsil_name),
    CONSTRAINT fk_district FOREIGN KEY (district_id)
        REFERENCES public.revenue_district_master (district_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.revenue_usage_category_master
(
    usage_category_id integer NOT NULL DEFAULT nextval('usage_category_master_usage_category_id_seq'::regclass),
    usage_category_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usage_category_master_pkey PRIMARY KEY (usage_category_id),
    CONSTRAINT uk_usage_category_name UNIQUE (usage_category_name),
    CONSTRAINT usage_category_master_usage_category_name_key UNIQUE (usage_category_name)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.revenue_village_master
(
    village_id integer NOT NULL DEFAULT nextval('village_master_village_id_seq'::regclass),
    village_name text COLLATE pg_catalog."default" NOT NULL,
    tehsil_id integer NOT NULL,
    is_urban boolean DEFAULT false,
    CONSTRAINT village_master_pkey PRIMARY KEY (village_id),
    CONSTRAINT uk_village_tehsil UNIQUE (village_name, tehsil_id),
    CONSTRAINT fk_tehsil FOREIGN KEY (tehsil_id)
        REFERENCES public.revenue_tehsil_master (tehsil_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)