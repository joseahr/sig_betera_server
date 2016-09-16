const db = require('../db').db;

const LocalStrategy = require('passport-local').Strategy;
const localLogin = require('./local-login');

module.exports = passport =>{

    // Serializa al usuario para almacenarlo en la sesión
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
 
    // deserializa al usuario, eliminándolo de la sesión
    passport.deserializeUser(function(id, done) {
        db.users.findBy('id', id)
        .then(user => done(null, user))
        .catch(err => done(err))
    });

    // Registro en la base de datos local
    passport.use('local-login', new LocalStrategy(localLogin.options, localLogin.callback) );

}