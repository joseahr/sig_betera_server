const express   = require('express');
const router    = express.Router();

const db = require('../db').db;

router.get('/perfil', (req, res)=>{
    if(!req.query.wkt){
        res.status(404).json('Debe pasar como parámetro un WKT');
    }
    db.raster.getProfile(req.query.wkt)
    .then( lineString3d =>{
        res.status(300).json(lineString3d.perfil);
    })
    .catch( err => res.status(500).json(err));
});

module.exports = router;