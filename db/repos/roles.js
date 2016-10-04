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
        hasPerms : (id_user, id_layer, ...roles)=>
            rep.oneOrNone(sql.hasPerm, {
                id_user : pgp.as.value(id_user || 0),
                id_layer : pgp.as.value(id_layer),
                roles
            }, hasPerm => hasPerm ? hasPerm.exists : null),
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
        // Obtener el rol de un usuario en una capa
        getRol : (id_user, id_layer)=>
            rep.oneOrNone(sql.getRol, {
                id_user : pgp.as.value(id_user || 0),
                id_layer : pgp.as.value(id_layer)
            }, rol => rol ? rol.rol : undefined),
    };
};