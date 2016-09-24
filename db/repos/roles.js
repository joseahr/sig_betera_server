'use strict';

const sql = require('../sql').roles;

module.exports = (rep, pgp) => {

    return {
        createTable : ()=>
            rep.none(sql.create),
        createEnum : ()=>
            rep.none(sql.createEnum),
        // Devuelve (id_capa, id_usuario, rol) de las capas 
        // de un Usuario
        getLayerNamesByPerms : (id_user, ...perms)=>
            rep.manyOrNone(sql.getLayerNamesByPerms, {
                id_user : pgp.as.value(id_user),
                perms
            }),
        // Comprobar si un usuario tiene permisos en una capa 
        hasPerm : (id_user, id_layer, rol)=>
            rep.oneOrNone(sql.hasPerm, {
                id_user : pgp.as.value(id_user),
                id_layer : pgp.as.value(id_layer),
                rol : pgp.as.value(rol)
            }, hasPerm => hasPerm.exists),
        // Añade permisos a un usuario en una capa
        addPerm : (id_user, id_layer, rol)=>
            rep.none(sql.addPerm, {
                values_ : [id_user, id_layer, rol]               
            }),
        // Actualizar un permiso de usuario
        updatePerm : (id_user, id_layer, rol)=>
            rep.none(sql.updatePerm, {
                id_user : pgp.as.value(id_user),
                id_layer : pgp.as.value(id_layer),
                rol : pgp.as.value(rol)            
            }),
    };
};