UPDATE public.eg_layout_owner SET status = true;

ALTER TABLE public.eg_layout_owner
  ALTER COLUMN status TYPE boolean USING status::boolean,
  ALTER COLUMN status SET DEFAULT true,
  ALTER COLUMN status SET NOT NULL;