const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res)=>{
    if(!req.isAuthenticated())
        return res.status(406).json('Permiso denegado');
    if(req.user.rol != 'admin')
        return res.status(406).json('Permiso denegado');
  	res.render('admin', {
		  title : 'SIG Ayuntamiento de Bétera'
	  });
});

module.exports = router;