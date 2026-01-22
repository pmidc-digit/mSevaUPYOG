ALTER TABLE public.eg_clu ADD COLUMN vasikaNumber character varying(15);

ALTER TABLE public.eg_clu ADD COLUMN vasikaDate character varying(10);

CREATE INDEX idx_eg_clu_vasika ON public.eg_clu (vasikaNumber, vasikaDate);