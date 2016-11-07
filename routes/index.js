const express = require('express');
const router = express.Router();
const db = require('../db').db;

const recaptcha = require('../recaptcha');

const mailer = require('../mailer');

/* GET home page. */
router.get('/', recaptcha.middleware.render, (req, res, next)=>{	
	let obj = {title : 'SIG ayuntamiento de Bétera', captcha : req.recaptcha }
	db.users.layers.getAllLayers()
	.then(allLayers =>{
		obj = Object.assign({}, obj, {allLayers});
		if(!req.user) return res.render('index', obj);
		db.users.maps.getMapsAndLayers(req.user.id)
		.then( maps =>{
			obj = Object.assign({}, obj, {maps});
			res.render('index', obj);
		})
	})
	.catch(err => next(err));
});

router.get('/visor', (req, res)=>{
	console.log('/visor', req.user);
	res.render('map', {
		title : 'SIG Ayuntamiento de Bétera - Visor'
	});
})

router.post('/contacto', recaptcha.middleware.verify, (req, res)=>{
	
	if (req.recaptcha.error) return res.status(500).json('No has verificado el re-captcha');

	let { subject, message, email } = req.body;
	if(!subject || !message || !email) return res.status(500).json('Faltan parámetros');
	let sendEmailTo = mailer.sendHTMLMailFrom(`"Usuario contacto 👥 "`);
	sendEmailTo(subject, 'Email : ' + email + '<br>' + message, 'joherro123@gmail.com')
	.then( ()=> res.status(200).json('OK'))
	.catch(err => res.status(500).json(err));

})

module.exports = router;