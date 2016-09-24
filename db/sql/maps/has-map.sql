SELECT EXISTS(
	SELECT * FROM ${schema~}.User_Maps
	WHERE id_map = ${id_map}
	AND id_user = ${id_user}
)