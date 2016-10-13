SELECT type 
FROM geometry_columns 
WHERE f_table_schema = 'capas'
AND f_table_name = ${table}
and f_geometry_column = ${geomColumn};