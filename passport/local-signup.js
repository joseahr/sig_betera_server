const { db, pgp } = require('../db');
const mailer = require('../mailer');

let options = {
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
};

let callback = function(req, email, password, done) {
    if (email)
        email = email.toLowerCase();    
    let { repassword, name, nombre, apellidos } = req.body;

    Promise.all([
        db.users.findBy('name', name),
        db.users.findBy('email', email)
    ])
    .then( users =>{
        if(users[0].length) 
            return done('El nombre de usuario escogido está siendo usado por otro usuario.');
        if(users[1].length)
            return done('El email introducido ya existe en la base de datos.');
        
        db.users.genPassword(password)
        .then( password =>{
            let cs = new pgp.helpers.ColumnSet(['email', 'name', 'password', 'nombre', 'apellidos'], {table: 'users'});
            let values = [{ email, name, password, nombre, apellidos }];
            let query = pgp.helpers.insert(values, cs) + ' RETURNING *';
            
            db.one(query)
            .then( user =>{
                console.log(user);
                db.one('SELECT token FROM users_not_valid_yet WHERE id = ${id_user}', { id_user : pgp.as.value(user.id) })
                .then( userToken =>{
                    mailer.sendTextMailTo(subject(nombre), content(nombre, apellidos, userToken.token), email)
                    .catch(err=> console.log('No se pudo enviar correo')); // Que lo haga en asíncrono
                    // No esperamos a que se envíe el mail
                    done(null, user, userToken.token );
                })
                .catch(err => done(`Error creando usuario : ${err}`) );
            })
            .catch(err => done(`Error creando usuario : ${err}`) );
        });

    })
    .catch(err => done(`Error creando usuario : ${err}`) );
};

module.exports = {
    options,
    callback
}

let subject = name => `Bienvenido a SIG Bétera ${name}`;
let content = ( nombre, apellidos, token ) => `
    Bienvenido a SIG Bétera ${nombre} ${apellidos},
    
    Nos complace que te registres como usuario, con el que podrás
    tener acceso a los mapas de esta web, así como de la información geográfica y 
    aplicaciones para el municipio de Bétera.

    Para finalizar el registro accede a : ${token}
`