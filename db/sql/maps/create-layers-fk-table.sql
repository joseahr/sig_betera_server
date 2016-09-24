CREATE TABLE ${schema~}.Map_Layers
(
    id_map integer NOT NULL,
    id_layer integer NOT NULL,
    CONSTRAINT maps_layers_unique PRIMARY KEY (id_layer, id_map),
    CONSTRAINT fk_maps_layers_layers FOREIGN KEY (id_layer)
      REFERENCES public.layers (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_maps_layers_maps FOREIGN KEY (id_map)
      REFERENCES public.maps (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
);