
ALTER TABLE public.eg_clu_owner
ADD COLUMN uuid VARCHAR(256);


UPDATE public.eg_clu_owner lo
SET uuid = u.uuid
FROM public.eg_user u
WHERE u.id::text = lo.id;


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
