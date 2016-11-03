SELECT u.id, u.name, u.email, u.rol, groups.*, maps__.*, mm.*, roles_.*
-- Seleccionamos id, nombre, email, rol de la tabla usuarios
FROM Users u 
-- Lo unimos con la tabla user_groups y obtenemos el grupo 
-- al que pertenece el usuario
LEFT JOIN LATERAL (
	SELECT array_agg(gg.group) AS grupos 
	FROM user_groups gg
	WHERE gg.id_user = u.id
) groups ON TRUE
LEFT JOIN LATERAL (
	SELECT json_agg(rr)::json AS layers_rol
	FROM (
		SELECT DISTINCT ml.id_layer, r.rol, l.name
		FROM user_maps um
		LEFT JOIN map_layers ml ON ml.id_map = um.id_map
		LEFT JOIN roles r ON r.id_layer = ml.id_layer AND r.id_user = u.id
		LEFT JOIN layers l ON l.id = ml.id_layer
		WHERE um.id_user = u.id
	) rr
) roles_ ON TRUE
LEFT JOIN LATERAL (
	SELECT json_agg(nam) AS not_assigned_maps FROM (
		SELECT * 
		FROM maps
		WHERE id NOT IN (
			SELECT id_map FROM user_maps umm WHERE umm.id_user = u.id 
		)
	) nam
) mm ON TRUE
-- Hacemos un lateral para poder referenciar
-- la tabla Users dentro del LEFT JOIN
LEFT JOIN LATERAL (
	-- Seleccionamos un Array de JSON de una subconsulta
	-- que obtendrá los mapas del usuario con sus respectivas capas
	SELECT json_agg(maps_)::json AS maps
	FROM (
		-- Seleccionamos el id del mapa y el nombre de la tabla
		-- user_maps de los mapas del usuario
		SELECT um.id_map, m.name, ly.*, bly.*
		FROM user_maps um
		-- Hacemos un lateral para poder referenciar la tabla user_maps
		-- dentro de el LEFT JOIN
		LEFT JOIN LATERAL (
			-- Seleccionamos el Array JSON de las capas del mapa
			-- pasándole una subconsulta
			SELECT json_agg(layers_)::json AS layers 
			FROM (
				-- Seleccionamos el id de la tabla map_layers
				SELECT ml.id_layer, ll.name
				FROM map_layers ml
				-- Lo unimos con la tabla layers para obtener
				-- el nombre de la capa
				LEFT JOIN layers ll ON ll.id = ml.id_layer
			) layers_
		) ly ON true
		-- Seleccionamos las capas WMS --> Lo mismo que para las capas postgis
		LEFT JOIN LATERAL (
			SELECT json_agg(baselayers_)::json AS baselayers 
			FROM (
				SELECT id_base_layer, bl.name AS capas, bl.service_url 
				FROM map_base_layers mbl
				LEFT JOIN base_layers bl ON bl.id = mbl.id_base_layer
				WHERE um.id_map = mbl.id_map
			) baselayers_
		) bly ON true
		LEFT JOIN maps m ON um.id_map = m.id
		WHERE um.id_user = u.id
	) maps_
) maps__ ON true