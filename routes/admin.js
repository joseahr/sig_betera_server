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
        db.admin.getUsers(),
        db.users.maps.getAllMaps(),
        db.users.maps.getDefaultMaps(),
        db.users.getAllGroups()
    ])
    .then( result =>{
        console.log(result);
        res.render('admin', {
            title : 'SIG Ayuntamiento de Bétera',
            allLayers : result[0],
            allBaseLayers : result[1],
            allUsers : result[2],
            allMaps : result[3],
            allDefaultMaps : result[4],
            allGroups : result[5]
        });
    })

});

/**************************
 * AÑADIR / ELIMINAR UN MAPA
 *  A UN USUARIO
 **************************/
router.route('/user/map')
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
})
.delete( (req, res)=>{
    let query = 'DELETE FROM user_maps WHERE id_user = ${id_user} AND id_map = ${id_map}';

    db.query(query, {
        id_user : pgp.as.value(req.body.id_user),
        id_map : pgp.as.value(req.body.id_map)
    })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );
});

/**************************
 * AÑADIR / ELIMINAR / ACTUALIZAR
 *  ROL DE UN USUARIO SOBRE UNA CAPA
 **************************/
router.route('/user/rol')
.post( (req, res)=>{
     // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id_user', 'id_layer', { name : 'rol', cast : 'public.roles_enum'}], {table: 'roles'});
    let { id_user, id_layer, rol } = req.body;
    if(!id_user || !id_layer || !rol) return res.status(404).json('Error : Faltan parámetros');
    // input values:
    let values = [{id_user: +id_user, id_layer: +id_layer, rol}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);
    
    db.query(query)
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );   
})
.put( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let { id_user, id_layer, rol } = req.body;
    if(!id_user || !id_layer || !rol) return res.status(404).json('Error : Faltan parámetros');
    let cs = new pgp.helpers.ColumnSet([{ name : 'rol', cast : 'public.roles_enum' }]);
    //console.log({ id_layer : +id_layer, id_user : +id_user, rol });
    // input values:
    let values = [{ rol }];

    // generating a multi-row insert query:
    let query = pgp.helpers.update(values, cs, 'roles', { tableAlias : 'r' }) + ' WHERE r.id_layer = ${id_layer} AND r.id_user = ${id_user}' ;
    
    db.query(query, { id_layer : pgp.as.value(+id_layer), id_user : pgp.as.value(+id_user) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM roles WHERE id_user = ${id_user} AND id_layer = ${id_layer}', { 
        id_user : pgp.as.value(req.body.id_user),
        id_layer : pgp.as.value(req.body.id_layer) 
    })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );
});

/**************************
 * AÑADIR / ELIMINAR / ACTUALIZAR
 *  GRUPO DE UN USUARIO
 **************************/
router.route('/user/group')
.post( (req, res)=>{
     // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id_user', 'group'], {table: 'user_groups'});
    let { id_user, group } = req.body;
    if(!id_user || !group) return res.status(404).json('Error : Faltan parámetros');
    // input values:
    let values = [{id_user: +id_user, group}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);
    
    db.query(query)
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );   
})
.delete( (req, res)=>{
    db.query('DELETE FROM user_groups WHERE "id_user" = ${id_user} AND "group" = ${group}', 
        { id_user : pgp.as.value(+req.body.id_user), group : pgp.as.value(req.body.group) }
    )
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );
});

/**************************
 * AÑADIR / ELIMINAR / ACTUALIZAR
 *  UN NUEVO GRUPO DE USUARIOS
 **************************/
router.route('/groups')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['name'], {table: 'groups'});

    // input values:
    //console.log(req.body);
    let values = [req.body];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);

    db.query(query)
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );  
})
.put( (req, res)=>{
    let { name, new_name } = req.body;
    if(!name || !new_name) return res.status(404).json('Error : Faltan parámetros');
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['name']);

    // input values:
    let values = [{ name : new_name }];

    // generating a multi-row insert query:
    let query = pgp.helpers.update(values, cs, 'groups', { tableAlias : 'g'}) + ' WHERE g.name = ${name}';
    
    db.query(query, { name : pgp.as.value(name) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM groups WHERE name = ${group}', { group : pgp.as.value(req.body.name) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error') );
});




router.route('/maps')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['name'], {table: 'maps'});

    // input values:
    //console.log(req.body);
    let values = [{name : req.body.name}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs) + ' RETURNING *';

    db.query(query)
    .then( result => res.status(200).json(result) )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM maps WHERE id = ${id_map}', { id_map : pgp.as.value(req.body.id_map) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) ); 
});


router.route('/maps/defaults')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id'], {table: 'default_maps'});

    // input values:
    //console.log(req.body);
    let values = [{id : req.body.id_map}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);

    db.query(query)
    .then( result => res.status(200).json(result) )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM default_maps WHERE id = ${id_map}', { id_map : pgp.as.value(req.body.id_map) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );    
});

router.route('/maps/layers')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id_map', 'id_layer'], {table: 'map_layers'});

    // input values:
    //console.log(req.body);
    let values = [{id_map : req.body.id_map, id_layer : req.body.id_layer}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);

    db.query(query)
    .then( result => res.status(200).json(result) )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM map_layers WHERE id_map = ${id_map} AND id_layer = ${id_layer}', 
        { id_map : pgp.as.value(req.body.id_map), id_layer : pgp.as.value(req.body.id_layer) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );  
});

router.route('/maps/baselayers')
.post( (req, res)=>{
    // performance-optimized, reusable set of columns:
    let cs = new pgp.helpers.ColumnSet(['id_map', 'id_base_layer'], {table: 'map_base_layers'});

    // input values:
    //console.log(req.body);
    let values = [{id_map : req.body.id_map, id_base_layer : req.body.id_layer}];

    // generating a multi-row insert query:
    let query = pgp.helpers.insert(values, cs);

    db.query(query)
    .then( result => res.status(200).json(result) )
    .catch(err => res.status(500).json('Error' + err) );
})
.delete( (req, res)=>{
    db.query('DELETE FROM map_base_layers WHERE id_map = ${id_map} AND id_base_layer = ${id_layer}', 
        { id_map : pgp.as.value(req.body.id_map), id_layer : pgp.as.value(req.body.id_layer) })
    .then( ()=> res.status(200).json('OK') )
    .catch(err => res.status(500).json('Error' + err) );     
});

router.route('/maps/order')
.post( (req, res)=>{
    db.query('DELETE FROM map_layers_order WHERE id_map = ${id_map}', { id_map : pgp.as.value(req.body.id_map) })
    .then( ()=>{
        // Orden eliminado
        // performance-optimized, reusable set of columns:
        let cs = new pgp.helpers.ColumnSet(['id_map', 'id_layer', 'layer_type', 'position'], {table: 'map_layers_order'});

        // input values:
        //console.log(req.body);
        let values = JSON.parse(req.body.order);
        console.log('valuees', values);
        // generating a multi-row insert query:
        let query = pgp.helpers.insert(values, cs);

        db.query(query)
        .then( result => res.status(200).json(result) )
    })
    .catch(err => res.status(500).json('Error' + err) );
});


router.route('/layers')
.post( (req, res)=>{
    
})
.delete( (req, res)=>{
    
});

router.route('/baselayers')
.post( (req, res)=>{
    
})
.delete( (req, res)=>{
    
});


router.route('/mail/groups')
.post( (req, res)=>{
    
});

router.route('/mail/users')
.post( (req, res)=>{
    
});


module.exports = router;