'use strict';

// Bluebird is the best promise library available today,
// and is the one recommended here:
const  promiseLib   = require('bluebird');

// Repositorios
const users         = require('./repos/users');
const raster        = require('./repos/raster');
const layers         = require('./repos/layers');
const roles        = require('./repos/roles');
const maps        = require('./repos/maps');
const admin        = require('./repos/admin');
// repositorio "capas" TODO

// Loading all the database repositories separately,
// because event 'extend' is called multiple times:
const repos = {
    users,
    raster,
    layers,
    roles,
    maps,
    admin
};

// pg-promise initialization options:
const options = {

    // Use a custom promise library, instead of the default ES6 Promise:
    promiseLib,
    
    // Extending the database protocol with our custom repositories:
    extend: obj => {
        // 1. Do not use 'require()' here, because this event occurs for every task
        //    and transaction being executed, which should be as fast as possible.
        // 2. We pass in `pgp` in case it is needed when implementing the repository;
        //    for example, to access namespaces `.as` or `.helpers`
        obj.users = repos.users(obj, pgp);
        obj.users.layers = repos.layers(obj, pgp);
        obj.users.roles = repos.roles(obj, pgp);
        obj.users.maps = repos.maps(obj, pgp);
        obj.raster = repos.raster(obj, pgp);
        obj.admin = repos.admin(obj, pgp);
    }

};

// Database connection parameters:
const config = require('../config').db;

// Load and initialize pg-promise:
const pgp = require('pg-promise')(options);

// Create the database instance:
const db = pgp(config);

// Load and initialize all the diagnostics:
const diag = require('./diagnostics');
diag.init(options);

// If you ever need to change the default pool size, here's an example:
// pgp.pg.defaults.poolSize = 20;

module.exports = {

    // Library instance is often necessary to access all the useful
    // types and namespaces available within the library's root:
    pgp,

    // Database instance. Only one instance per database is needed
    // within any application.
    db
};

/********* TEST *********/
// 'LINESTRING (712397 4394802,712450 4394800)'
//db.raster.getProfile('LINESTRING (712397 4394802,712450 4394800)')
//.then(console.log.bind(console))
//.catch(console.error.bind(console));