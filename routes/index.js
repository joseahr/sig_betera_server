const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res)=>{
	console.log('/', req.user);
  	res.render('index', {
		  title : 'SIG Ayuntamiento de Bétera'
	  });
});

router.get('/visor', (req, res)=>{
	console.log('/visor', req.user);
	res.render('map', {
		title : 'SIG Ayuntamiento de Bétera - Visor'
	});
})

module.exports = router;