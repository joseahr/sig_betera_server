-- ### Creamos roles 
-- r : read (Un usuario puede ver esa capa)
-- e : edit (Un usuario puede editar esa capa)
-- d : delete (Un usuario puede eliminar esa capa)
CREATE TYPE roles_enum AS ENUM ('r', 'e', 'd');