SELECT EXISTS(
	SELECT * FROM ${schema~}.Roles 
	WHERE id_user = ${id_user}
	AND id_layer = ${id_layer}
	AND rol IN (${roles:csv})
)