UPDATE public.eg_clu_owner SET status = true;

ALTER TABLE public.eg_clu_owner
  ALTER COLUMN status TYPE boolean USING status::boolean,
  ALTER COLUMN status SET DEFAULT true,
  ALTER COLUMN status SET NOT NULL;