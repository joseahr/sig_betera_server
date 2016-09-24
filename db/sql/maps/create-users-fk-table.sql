CREATE TABLE ${schema~}.User_Maps
(
    id_user integer NOT NULL,
    id_map integer NOT NULL,
    CONSTRAINT maps_users_unique PRIMARY KEY (id_user, id_map),
    CONSTRAINT fk_maps_users_users FOREIGN KEY (id_user)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_maps_users_maps FOREIGN KEY (id_map)
      REFERENCES public.maps (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
);