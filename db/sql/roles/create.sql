CREATE TABLE ${schema~}.Roles
(
    id_user integer NOT NULL,
    id_layer integer NOT NULL,
    rol ROLES_ENUM NOT NULL DEFAULT 'r',
    CONSTRAINT roles_pkey PRIMARY KEY (id_user, id_layer),
    CONSTRAINT fk_roles_layers FOREIGN KEY (id_layer)
      REFERENCES public.layers (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_roles_users FOREIGN KEY (id_user)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
);