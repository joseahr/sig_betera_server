const express   = require('express');
const router    = express.Router();
const passport  = require('passport');

const mailer = require('../mailer');

const db = require('../db').db;

router.post('/login', (req, res)=>{
  console.log(req.body.username, req.body.password);
  // Comprobamos que req.body.username && req.body.password existan
  if(!req.body.username || !req.body.password)
    return res.status(400).json('Faltan credenciales de acceso');
  
  // Intentamos autenticarnos 
  passport.authenticate('local-login', (err, user, info)=>{
    // Si ha habido un error mandamos un status 500
    if(err) 
      return res.status(500).json(err);
    // Si no se ha encontrado ningún usuario mandamos status 404
    if(!user) 
      return res.status(404).json(info);
    // Intentamos logearnos en la sesión
    req.logIn(user, err =>{
      // Enviamos un status 200
      res.status(200).json(user.toString() + info);
    });
  // llamamos a la función middleware que devuelve passport.authenticate() 
  // con los parámetros req y res
  })(req, res);
});

router.post('/signup', (req, res)=>{
  console.log(req.body);
  let { name, password, repassword, nombre, apellidos, email } = req.body;
  console.log({ name, password, repassword, nombre, apellidos, email });
  // Comprobamos que req.body.username && req.body.password existan
  if(!name || !password || !nombre || !apellidos || !email || !repassword)
    return res.status(400).json('Faltan credenciales de acceso');
  if(password != repassword)
    return res.status(400).json('Las contraseñas no coinciden');

  passport.authenticate('local-signup', (err, user, token)=>{
    // Si ha habido un error mandamos un status 500
    console.log(err, user, token);
    if(err) 
      return res.status(500).json(err);

    res.status(200).json({ user });

  })(req, res);
});

router.get('/logout', (req, res)=>{
  if(!req.user)
    return res.status(404).json('No hay usuario en la sesión');
  req.logout();
  res.status(200).json('Cerraste sesión');
});

router.get('/validar/:token', (req, res)=>{
  let token = req.params.token;
  db.one("SELECT EXISTS ( SELECT token FROM users_not_valid_yet WHERE token = '${token#}' ) AS exist", { token })
  .then(result =>{
    let exist = result.exist;
    if(!exist) return res.status(500).json('No existe ningún usuario no válido con token ' + token);
    db.none("DELETE FROM users_not_valid_yet WHERE token = '${token#}'", { token })
    .then( ()=> res.status(200).json('Usuario validado correctamente') )
    .catch(err => res.status(500).json(err) );
  })
  .catch(err => res.status(500).json(err) );
});

router.
route('/password')
.post((req, res)=>{
  db.users.findBy('email', req.body.email)
  .then( user =>{
    if(!user.length) return res.status(500).json('Usuario no encontrado');
    console.log(user);
    user = user[0];
    db.users.createForgetToken(user.id)
    .then( token =>{
      let forgotMsg = mailer.defaultMessages.forgotPassword;

      mailer.sendHTMLMailTo(
        forgotMsg.subject(user.name)
        , forgotMsg.content(user.nombre
        , user.apellidos, token.token), user.email 
      )
      .then( ()=> res.status(200).json('OK'))
      .catch(err => res.status(500).json('err2' + err));
    })
    .catch(err => res.status(500).json('err' + err) )
  })
  .catch(err => res.status(500).json('eerr1' + err) )
})
.put((req, res)=>{
  let token = req.body.token;
  let password = req.body.password;
  let repassword = req.body.repassword;
  console.log(password, repassword, token);
  if(password !== req.body.repassword) return res.status(500).json('Las contraseñas no coinciden');
  if(password.length < 5) return res.status(500).json('La contraseña debe tener al menos 5 caracteres');

  db.one("SELECT id FROM public.users_change_password_token WHERE token = '${token#}'", {token})
  .then(user => {
    db.users.genPassword(password)
    .then( password =>{
      db.none("UPDATE Users SET password = '${password#}' WHERE id = '${id#}'", {id : user.id, password})
      .then( ()=> db.none("DELETE FROM public.users_change_password_token WHERE token = '${token#}'", {token}) )
      .then( ()=> res.status(200).json('Contraseña Actualizada') )
      .catch(err => res.status(500).json(err) )
    })
    .catch(err => res.status(500).json(err));
  })
  .catch(err => res.status(500).json('No existe un usuario que concuerde con el token') );
});

router.get('/password/:token', (req, res)=>{
  let token = req.params.token;
  db.one("SELECT token FROM public.users_change_password_token WHERE token = '${token#}'", {token})
  .then(user => {
    let token = user.token;
    res.render('password-token', {token})
  })
  .catch(err => res.status(500).json('No existe un usuario que concuerde con el token') );
});

module.exports = router;
