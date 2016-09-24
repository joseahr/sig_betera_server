SELECT type 
FROM geometry_columns 
WHERE f_table_schema = ${schema} 
AND f_table_name = ${table}
and f_geometry_column = ${geomColumn};