'use strict';

const sql = require('../sql').users;

const bluebird = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const compare = bluebird.promisify(bcrypt.compare);

module.exports = (rep, pgp) => {

    /*
     This repository mixes hard-coded and dynamic SQL,
     primarily to show a diverse example of using both.
     */

    return {
        getAllGroups : ()=>
            rep.one(sql.getAllGroups)
                .then(allGroups => allGroups.groups),

        validPassword: (user, password) =>
            compare(password, user.password),

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

        // Drops the table;
        drop: () =>
            rep.none(sql.drop),

        // Removes all records from the table;
        empty: () =>
            rep.none(sql.empty),

        // Adds a new user, and returns the new id;
        add: name =>
            rep.one(sql.add, name, user => user.id),

        // Tries to delete a user by id, and returns the number of records deleted;
        remove: id =>
            rep.result('DELETE FROM Users WHERE id = $1', id, r => r.rowCount),

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