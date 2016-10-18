SELECT Maps.*, lay.*, blay.*, o.*
FROM Maps
LEFT JOIN LATERAL (
    SELECT array_agg(ll.id_layer)::integer[] as layers
    FROM (
        SELECT id_layer FROM Map_Layers ul WHERE ul.id_map = Maps.id
    ) ll
) lay ON TRUE
LEFT JOIN LATERAL (
    SELECT array_agg(bbll.id_base_layer)::integer[] as baselayers
    FROM (
        SELECT id_base_layer FROM Map_Base_Layers ul WHERE ul.id_map = Maps.id
    ) bbll
) blay ON TRUE
LEFT JOIN LATERAL (
    SELECT json_agg(oo)::json AS orden
    FROM (
        SELECT *
        FROM map_layers_order
        WHERE id_map = Maps.id
    ) oo
) o ON TRUE
WHERE id IN (SELECT id FROM Default_Maps)