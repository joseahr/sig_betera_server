SELECT row_to_json(fc)::json as result
FROM ( 
    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f))::json As features
    FROM (
        SELECT 'Feature' As type
            , ST_AsGeoJSON(lg.${geomColumn^})::json As geometry
            , row_to_json((SELECT l FROM (SELECT ${properties^}) As l))::json As properties
        FROM "capas".${layerName~} As lg   
    ) As f 
)  As fc;