SELECT row_to_json(fc)::json as found
    , '${layerName#}'::text as layerName
FROM ( 
    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f))::json As features
    FROM (
        SELECT 'Feature' As type
            , ST_AsGeoJSON(lg.${geomColumn^})::json As geometry
            , row_to_json(
                (SELECT l FROM (
		            SELECT 
                        ${properties^},
			            dd.*
	            ) As l)
            )::json As properties
        FROM "capas".${layerName~} As lg
        LEFT JOIN LATERAL (
		    SELECT array_agg(ddd) AS data_urls
		    FROM (
			    SELECT url FROM datos
			    WHERE gid = lg.gid 
			    AND capa = '${layerName#}' 
		    ) ddd
	    ) dd ON TRUE
        WHERE ST_Intersects(the_geom, 'SRID=25830;${wkt#}'::geometry)  
    ) As f 
)  As fc;
