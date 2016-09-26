const express   = require('express');
const router    = express.Router();

const db = require('../db').db;

router
.route('/:id_layer')
.get( (req, res)=>{
    if(!req.user) return res.status(500).json('No capas asignadas');

    db.users.roles.hasPerms(req.user.id, req.params.id_layer, 'r', 'e', 'd')
    .then(hasPerms =>{

        db.users.roles.getRol(req.user.id, req.params.id_layer)
        .then(rol =>{
            db.users.layers.getLayerNames(req.params.id_layer)
            .then(layerName => {

                layerName = layerName[0];

                if(layerName.name && !hasPerms) return res.status(200).json(layerName.name);

                db.users.layers.getLayerAsGeoJSON(layerName.name)
                .then(layerGeoJSON =>{
                    layerGeoJSON.rol = rol;
                    res.status(200).json(layerGeoJSON);
                });

            });
        });
    })
    .catch(err => res.status(500).json(err));

});

module.exports = router;