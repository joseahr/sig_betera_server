const express   = require('express');
const router    = express.Router();

const capabilitiesParser = require('../capabilities-parser');
const db = require('../db').db;

router.route('/features/byGeom')
.post( (req, res)=>{
    console.log('byGeom');
    if(!req.body.wkt) return res.status(500).json('Debe enviar una extensión, área o punto.');
    if(!req.body.layers || !req.body.layers.length) return res.status(500).json('Debe enviar al menos una capa en la que buscar.');
    if(typeof req.body.layers === 'string') req.body.layers = req.body.layers.split(',');

    db.users.layers.getFeaturesIntersecting(req.body.wkt, ...req.body.layers)
    .then(result => res.status(200).json(result) )
    .catch(err => res.status(500).json('Hubo un error durante la búsqueda.') );
});

router
.post('/wms/getCapabilities', (req, res)=>{
    let serviceUrl = req.body.service_url;
    console.log(serviceUrl, req.body);
    if(!serviceUrl) return res.status(500).json('Introduce una url');
    capabilitiesParser.parse(serviceUrl)
    .then(layers =>{
        if(!layers || !layers.length) return res.status(500).json('No es un capabilities válido');
        res.status(200).json(layers);
    })
    .catch(err => res.status(500).json('eeer' + err));
});

router
.route('/:id_layer')
.get( (req, res)=>{
    //if(!req.user) return res.status(500).json('No capas asignadas');
    var id = req.user ? req.user.id : null;

    // Buscamos qué rol tiene sobre la capa
    db.users.roles.getRol(id, req.params.id_layer)
    .then(rol =>{
        // Qué nombre tiene la capa
        rol = rol || 'r';
        db.users.layers.getLayerNames(req.params.id_layer)
        .then(layerName => {
            console.log(layerName);
            layerName = layerName[0];
            // Obtener la capa como GeoJSON
            res.status(200).json({
                rol,
                layerName 
            });
        });
    })
    .catch(err => res.status(500).json(err));

});

router
.route('/base/:id_layer')
.get( (req, res)=>{
    console.log(req.params.id_layer);
    //if(!req.user) return res.status(500).json('No capas asignadas');
    db.users.layers.getBaseLayer(req.params.id_layer)
    .then(baseLayer => res.status(200).json(baseLayer) )
    .catch(err => res.status(404).json(err) );
});

module.exports = router;