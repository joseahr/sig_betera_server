SELECT m.*, lay.*, blay.*, orden.*
FROM Maps m
LEFT JOIN LATERAL (
    SELECT array_agg(ll.id_layer)::integer[] as layers
    FROM (
        SELECT id_layer FROM Map_Layers ul WHERE ul.id_map = m.id
    ) ll
) lay ON TRUE
LEFT JOIN LATERAL (
    SELECT array_agg(bbll.id_base_layer)::integer[] as baselayers
    FROM (
        SELECT id_base_layer FROM Map_Base_Layers ul WHERE ul.id_map = m.id
    ) bbll
) blay ON TRUE
LEFT JOIN LATERAL (
	SELECT json_agg(oo)::json AS orden
	FROM (
		SELECT id_layer, layer_type, position FROM map_layers_order WHERE id_map = m.id
	) oo
) orden ON TRUE