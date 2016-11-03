const db = require('../db').db;

let callback = (req, username, password, done)=>{
    console.log('local-login callback');
    /*
    #### Buscar en la base de datos un usuario que coincida con el 
    #### nombre de usuario pasado como param. 
    #### Se comprueba también que coincida la contraseña 
    #### "done" es una función de callback de la estrategia de login local
    #### de passport (local-strategy)
    */
    let func = ()=>
        // Buscamos al usuario por "name" 
        Promise.all([
            db.users.findBy('name', username),
            db.users.findBy('email', username)
        ])
        .then( user=>{
            user = user[0].length 
                ? user[0][0] : user[1].length 
                ? user[1][0] : false;

            if(!user) done(null, false, 'Usuario no encontrado');
            else {
                db.users.isValid(user.id)
                .then( isValid =>{
                    console.log(isValid);
                    if(!isValid) return done(false, false, 'Usuario no válido. Revisa tu correo y sigue las instrucciones : ' + user.email);
                    console.log('usuario encontrado en la bdd', user, password);
                    db.users.validPassword(user, password)
                    .then(validPassword =>{
                        console.log('Comparando contraseñas : ', validPassword)
                        if(validPassword){
                            req.user = user;
                            done(null, user, 'Login Correcto');
                        }
                        else 
                            done(null, false, 'La contraseña no coincide');
                    })
                    .catch(err => done(err));
                })
            }
        })
        .catch(err => {
            console.log('error : ', err);
            done(err)
        });
    // Ejecutamos la función en el siguiente "tick" del event-loop
    process.nextTick(func);
};
let options = {
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // Nos permite pasar el request al callback (saber si el usuario está logeado)
};

module.exports =  {
    callback,
    // De que columnas coger los valores
    options
}