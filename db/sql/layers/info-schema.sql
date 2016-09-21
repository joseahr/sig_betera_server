SELECT column_name as name,
	data_type as type
FROM information_schema.columns
WHERE table_name = ${tableName};