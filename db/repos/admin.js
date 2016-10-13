'use strict';

const sql = require('../sql').admin;

module.exports = (rep, pgp) => {
    return {
        getUsers : ()=>
            rep.manyOrNone(sql.getUsers),
    }
}