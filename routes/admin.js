const express = require('express');
const router = express.Router();
const { db, pgp } = require('../db');
/* GET home page. */

/*
router.use( (req, res, next)=>{
    if(!req.isAuthenticated())
        return res.status(406).json('Permiso denegado');
    if(req.user.rol != 'admin')
        return res.status(406).json('Permiso denegado');
    next();
});
*/

router.get('/', (req, res)=>{
    Promise.all([
        db.users.layers.getAllLayers(),
        db.users.layers.getAllBaseLayers(),
        db.admin.getUsers()
    ])
    .then( result =>{
        console.log(result);
        res.render('admin', {
            title : 'SIG Ayuntamiento de Bétera',
            allLayers : result[0],
            allBaseLayers : result[1],
            allUsers : result[2]
        });
    })

});

router.route('/user/addmap')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id_user', 'id_map'], {table: 'user_maps'});

    // input values:
    let values = [{id_user: req.body.id_user, id_map: req.body.id_map}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);
    
    db.query(query)
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );
});

router.route('/user/removemap')
.post( (req, res)=>{
    let query = 'DELETE FROM user_maps WHERE id_user = ${id_user} AND id_map = ${id_map}';

    db.query(query, {
        id_user : pgp.as.value(req.body.id_user),
        id_map : pgp.as.value(req.body.id_map)
    })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );
});

module.exports = router;