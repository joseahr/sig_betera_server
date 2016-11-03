SELECT NOT EXISTS (
	SELECT * 
	FROM users_not_valid_yet
	WHERE id = ${id_user}
) AS valid