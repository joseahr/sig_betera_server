SELECT *
FROM Maps m
LEFT JOIN User_Maps um ON um.id_map = m.id
LEFT JOIN LATERAL (
    SELECT json_agg(oo)::json AS orden
    FROM (
        SELECT *
        FROM map_layers_order
        WHERE id_map = m.id
    ) oo
) o ON TRUE
WHERE um.id_user = ${id_user}