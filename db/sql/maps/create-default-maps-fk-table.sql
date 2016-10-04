CREATE TABLE public.default_maps (
  id integer NOT NULL,
  CONSTRAINT pk_default_maps PRIMARY KEY (id),
  CONSTRAINT fk_default_maps FOREIGN KEY (id)
      REFERENCES public.maps (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)