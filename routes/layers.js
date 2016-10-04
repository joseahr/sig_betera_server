const express   = require('express');
const router    = express.Router();

const db = require('../db').db;

router
.route('/:id_layer')
.get( (req, res)=>{
    //if(!req.user) return res.status(500).json('No capas asignadas');
    var id = req.user ? req.user.id : null;
    // Enviamos consulta para saber si tiene permisos sobre la capa
    db.users.roles.hasPerms(id, req.params.id_layer, 'e', 'd')
    .then(hasPerms =>{
        // hasPerms devuelve true o false
        // Buscamos qué rol tiene sobre la capa
        db.users.roles.getRol(id, req.params.id_layer)
        .then(rol =>{
            // Qué nombre tiene la capa
            db.users.layers.getLayerNames(req.params.id_layer)
            .then(layerName => {
                layerName = layerName[0];
                // Obtener la capa como GeoJSON
                db.users.layers.getLayerAsGeoJSON(layerName.name)
                .then(layerGeoJSON =>{
                    layerGeoJSON.rol = hasPerms ? rol : 'r';
                    res.status(200).json(layerGeoJSON);
                });
            });
        });
    })
    .catch(err => res.status(500).json(err));

});

module.exports = router;