const express   = require('express');
const router    = express.Router();
const passport  = require('passport');

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
  let { name, password, repassword, nombre, apellidos, email } = req.body;
  // Comprobamos que req.body.username && req.body.password existan
  if(!name || !password || !nombre || !apellidos || !email || !repassword)
    return res.status(400).json('Faltan credenciales de acceso');
  if(password != repassword)
    return res.status(400).json('Las contraseñas no coinciden');

  passport.authenticate('local-signup', (err, user, token)=>{
    // Si ha habido un error mandamos un status 500
    if(err) 
      return res.status(500).json(err);

    res.status(200).json({ user, token });

  })(req, res);
});

router.get('/logout', (req, res)=>{
  if(!req.user)
    return res.status(404).json('No hay usuario en la sesión');
  req.logout();
  res.status(200).json('Cerraste sesión');
});

module.exports = router;
