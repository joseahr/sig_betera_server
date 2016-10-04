SELECT * FROM ${schema~}.Maps
WHERE id IN (SELECT id FROM ${schema~}.Default_Maps)