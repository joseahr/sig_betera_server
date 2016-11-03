SELECT 
EXISTS(
	SELECT * FROM ${schema~}.Roles 
	WHERE id_user = '${id_user#}'
	AND id_layer = '${id_layer#}'
	AND rol IN (${roles:csv})
) 
OR
EXISTS(
	SELECT * FROM ${schema~}.Map_Layers ml
	WHERE ml.id_map IN (
		SELECT * FROM ${schema~}.User_Maps un
		WHERE um.id_map = ml.id_map AND um.id_user = '${id_user#}'
	)
	AND ml.id_layer = '${id_layer#}'
) 
