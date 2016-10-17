SELECT * 
FROM Maps m
LEFT JOIN User_Maps um ON um.id_map = m.id 
WHERE um.id_user = ${id_user}