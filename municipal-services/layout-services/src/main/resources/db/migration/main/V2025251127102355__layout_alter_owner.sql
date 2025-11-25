
ALTER TABLE public.eg_layout_owner
ADD COLUMN uuid VARCHAR(256);


UPDATE public.eg_layout_owner lo
SET uuid = u.uuid
FROM public.eg_user u
WHERE u.id::text = lo.id;


ALTER TABLE public.eg_layout_owner
DROP CONSTRAINT pk_eg_layout_owner;



ALTER TABLE public.eg_layout_owner
ADD CONSTRAINT pk_eg_layout_owner PRIMARY KEY (uuid, layoutid);


ALTER TABLE public.eg_layout_owner
DROP CONSTRAINT fk_eg_layout_owner;


ALTER TABLE public.eg_layout_owner
ADD CONSTRAINT fk_eg_layout_owner FOREIGN KEY (layoutid)
  REFERENCES public.eg_layout (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
