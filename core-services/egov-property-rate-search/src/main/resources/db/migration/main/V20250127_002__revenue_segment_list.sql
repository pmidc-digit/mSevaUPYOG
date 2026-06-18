-- 1. Create Usage Category (Parent of Sub Category)
-- Fixed: Removed duplicate unique constraint

CREATE TABLE IF NOT EXISTS public.revenue_usage_category_master
(
    usage_category_id integer NOT NULL,
    usage_category_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT usage_category_master_pkey PRIMARY KEY (usage_category_id),
    CONSTRAINT uk_usage_category_name UNIQUE (usage_category_name)
);

-- 2. Create Sub Category (Child of Usage Category)
-- Fixed: FK references 'revenue_usage_category_master' instead of 'usage_category_master'

CREATE TABLE IF NOT EXISTS public.revenue_sub_category_master
(
    sub_category_id integer NOT NULL,
    sub_category_name text COLLATE pg_catalog."default" NOT NULL,
    usage_category_id integer NOT NULL,
    CONSTRAINT sub_category_master_pkey PRIMARY KEY (sub_category_id),
    CONSTRAINT uk_sub_category_name UNIQUE (sub_category_name)
);


-- 3. Create Tehsil (Parent of Village)
-- Note: Assumes 'revenue_district_master' exists in a previous migration

CREATE TABLE IF NOT EXISTS public.revenue_tehsil_master
(
    tehsil_id integer NOT NULL,
    tehsil_name text COLLATE pg_catalog."default" NOT NULL,
    district_id integer NOT NULL,
    CONSTRAINT tehsil_master_pkey PRIMARY KEY (tehsil_id),
    CONSTRAINT uk_tehsil_name_id UNIQUE (tehsil_name, tehsil_id)
);


-- 4. Create Village (Parent of Segment Master)
-- Fixed: FK references 'revenue_tehsil_master'

CREATE TABLE IF NOT EXISTS public.revenue_village_master
(
    village_id integer NOT NULL,
    village_name text COLLATE pg_catalog."default" NOT NULL,
    tehsil_id integer NOT NULL,
    is_urban boolean DEFAULT false,
    CONSTRAINT village_master_pkey PRIMARY KEY (village_id),
    CONSTRAINT uk_village_tehsil UNIQUE (village_name, tehsil_id),
    CONSTRAINT fk_tehsil FOREIGN KEY (tehsil_id)
        REFERENCES public.revenue_tehsil_master (tehsil_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);


-- 5. Create Segment Master (Parent of Segment List)
-- Fixed: FK references 'revenue_village_master' instead of 'village_master'

CREATE TABLE IF NOT EXISTS public.revenue_segment_master
(
    segment_list_id integer,
    segment_level_id integer NOT NULL,
    segment_name text COLLATE pg_catalog."default" NOT NULL,
    village_id integer NOT NULL,
    CONSTRAINT revenue_segment_master_pkey PRIMARY KEY (segment_level_id)
);

-- 6. Create Segment List (The table you asked about)
-- Fixed: Removed garbage text and pointed FK to 'revenue_segment_master'

CREATE TABLE IF NOT EXISTS public.revenue_sub_segment_list
(
    sub_segment_id integer NOT NULL,
    sub_segment_name text COLLATE pg_catalog."default" NOT NULL,
    segment_level_id integer NOT NULL,
    CONSTRAINT sub_segment_list_pkey PRIMARY KEY (sub_segment_id),
    CONSTRAINT uk_sub_segment_name UNIQUE (sub_segment_id, sub_segment_name),
    CONSTRAINT fk_sub_segment_level_new FOREIGN KEY (segment_level_id)
        REFERENCES public.revenue_segment_master (segment_level_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);