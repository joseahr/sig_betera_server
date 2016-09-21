'use strict';

const sql = require('../sql').roles;

module.exports = (rep, pgp) => {

    return {
        createTable : ()=>
            rep.none(sql.create),
        createEnum : ()=>
            rep.none(sql.createEnum),
        getLayerNamesByPerms : (id_user, ...perms)=>
            rep.manyOrNone(sql.getLayerNamesByPerms, {
                id_user : pgp.as.value(id_user),
                perms : `{${pgp.as.value(perms.join())}}`
            })
    };
};