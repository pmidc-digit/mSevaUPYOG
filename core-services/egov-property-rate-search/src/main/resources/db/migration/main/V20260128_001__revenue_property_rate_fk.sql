

ALTER TABLE public.revenue_property_rate_master
ADD CONSTRAINT property_rate_master_segment_list_id_fkey
FOREIGN KEY (segment_list_id)
REFERENCES public.revenue_segment_list (segment_list_id);

ALTER TABLE public.revenue_property_rate_master
ADD CONSTRAINT property_rate_master_sub_category_id_fkey
FOREIGN KEY (sub_category_id)
REFERENCES public.revenue_sub_category_master (sub_category_id);
