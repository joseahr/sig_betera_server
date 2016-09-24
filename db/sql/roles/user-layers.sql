SELECT r.*, ly.name FROM Roles r
LEFT JOIN Layers ly ON r.id_layer = ly.id
WHERE id_user = ${id_user} AND rol IN (${perms:csv});