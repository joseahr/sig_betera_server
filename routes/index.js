const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res)=>{
  	res.render('index', {
		  title : 'SIG Ayuntamiento de Bétera'
	  });
});

router.get('/visor', (req, res)=>{
	res.render('map', {
		title : 'SIG Ayuntamiento de Bétera - Visor'
	});
})

module.exports = router;