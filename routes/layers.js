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

router.get('/', (req, res)=>{

});

module.exports = router;