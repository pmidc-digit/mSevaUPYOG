ALTER TABLE public.eg_layout ADD COLUMN vasikaNumber character varying(15);

ALTER TABLE public.eg_layout ADD COLUMN vasikaDate character varying(10);

CREATE INDEX idx_eg_layout_vasika ON public.eg_layout (vasikaNumber, vasikaDate);