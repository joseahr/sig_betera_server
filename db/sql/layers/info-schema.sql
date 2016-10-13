SELECT column_name as name,
		data_type as type,
		-- udt_name (user defined types)
		udt_name as udt
FROM information_schema.columns
WHERE table_name = ${tableName}
AND table_schema = 'capas';