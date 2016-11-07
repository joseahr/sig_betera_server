'use strict';

const sql = require('../sql').users;

const bluebird = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const compare = bluebird.promisify(bcrypt.compare);
const hash = bluebird.promisify(bcrypt.hash);
const genSalt = bluebird.promisify(bcrypt.genSalt);

module.exports = (rep, pgp) => {

    /*
     This repository mixes hard-coded and dynamic SQL,
     primarily to show a diverse example of using both.
     */

    return {

        setVisibleMap : (id_user, id_map) =>
            rep.none("UPDATE User_Maps SET visible = true WHERE id_map = '${id_map#}' AND id_user = '${id_user#}'", 
                {id_user, id_map}),

        deleteForgetToken : id_user =>
            rep.none("DELETE FROM users_change_password_token WHERE id = '${id_user#}'", {id_user}),

        createForgetToken : id_user =>
            rep.one(sql.createForgetToken, {id_user}),

        findIdByToken : token =>
            rep.oneOrNone(sql.findIdByToken, { token : pgp.as.value(token) } ),
        
        isValid : id => 
            rep.one(sql.isValid, { id_user : pgp.as.value(id) } )
            .then(isValid => isValid.valid),

        getAllGroups : ()=>
            rep.one(sql.getAllGroups)
                .then(allGroups => allGroups.groups),

        validPassword: (user, password) =>
            compare(password, user.password),
        
        genPassword : password =>
            hash(password, null, null),

        findBy: (column, value) =>
            rep.any(sql.findBy, {
                column: pgp.as.name(column),
                value: pgp.as.value(value)
            }),
        // Crear el enum de roles
        createRolesEnum : ()=>
            rep.none(sql.createRolesEnum),
        // Creates the table;
        create: () =>
            rep.none(sql.create),

        // Crea la extensión "citext"(Case Insensitive text) para poder utilizar este tipo de dato en la columna e-mail
        // http://dba.stackexchange.com/a/74313
        createCitextExtension : ()=> 
            rep.none(sql.createCitextExtension),

        init: () =>
            rep.tx('Demo-Users', t => t.map(sql.init, null, row => row.id)),

        // Tries to find a user from id;
        find: id =>
            rep.oneOrNone('SELECT * FROM Users WHERE id = $1', id),

        // Returns all user records;
        all: () =>
            rep.any('SELECT * FROM Users'),

        // Returns the total number of users;
        total: () =>
            rep.one('SELECT count(*) FROM Users', [], a => +a.count)
    };
};