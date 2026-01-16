ALTER TABLE public.eg_noc ADD COLUMN vasikaNumber character varying(15);

ALTER TABLE public.eg_noc ADD COLUMN vasikaDate character varying(10);

CREATE INDEX idx_eg_noc_vasika ON public.eg_noc (vasikaNumber, vasikaDate);