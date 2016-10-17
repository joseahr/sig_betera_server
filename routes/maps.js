const express   = require('express');
const router    = express.Router();

const db = require('../db').db;

/*const SphericalMercator = require('sphericalmercator');

router.get('/vector-tiles/:layername/:z/:x/:y.pbf', (req, res)=>{
    let mercator = new SphericalMercator({
        size: 256 //tile size
    });

    var bbox = mercator.bbox(
        +req.params.x,
        +req.params.y,
        +req.params.z,
        false,
        '25830'
    )
});
*/

/*router.get('/', (req, res)=>{
    if(!req.user)
        return res.status(400).json('No tiene acceso');
    db.users.roles.getLayerNamesByPerms(req.user.id, 'r', 'e', 'd')
    .then( layerNames =>{
        if(!layerNames.length) return res.status(400).json('No tiene acceso');
        Promise.all(layerNames.map(l => db.users.layers.getLayerAsGeoJSON(l.name)))
            .then(layers => {
                layers.forEach( l =>{
                    let rol = layerNames.find( ln => ln.name === l.layerName ).rol;
                    l.rol = rol;
                });
                res.status(200).json(layers); 
            })
            .catch(err => { res.status(500).json(err) });
    })
});*/

router
.route('/')
.get( (req, res)=>{
    let id = req.user ? req.user.id : null;
    db.users.maps.getMapsAndLayers(id)
    .then( mapsAndLayers => res.status(200).json(mapsAndLayers) )
    .catch( err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;