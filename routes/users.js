const express   = require('express');
const router    = express.Router();
const passport  = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', (req, res)=>{
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

module.exports = router;
