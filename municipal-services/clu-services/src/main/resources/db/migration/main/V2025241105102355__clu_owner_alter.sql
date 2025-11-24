
ALTER TABLE public.eg_clu_owner
ADD COLUMN uuid VARCHAR(256);


ALTER TABLE public.eg_clu_owner
ALTER COLUMN uuid SET NOT NULL;


ALTER TABLE public.eg_clu_owner
DROP CONSTRAINT pk_eg_clu_owner;



ALTER TABLE public.eg_clu_owner
ADD CONSTRAINT pk_eg_clu_owner PRIMARY KEY (uuid, cluid);


ALTER TABLE public.eg_clu_owner
DROP CONSTRAINT fk_eg_clu_owner;


ALTER TABLE public.eg_clu_owner
ADD CONSTRAINT fk_eg_clu_owner FOREIGN KEY (cluid)
  REFERENCES public.eg_clu (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
