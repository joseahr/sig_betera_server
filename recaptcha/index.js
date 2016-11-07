const recaptcha = require('express-recaptcha');
const recaptchaConfig = require('../config').recaptcha;

recaptcha.init(recaptchaConfig.SITE_KEY, recaptchaConfig.SITE_SECRET);

module.exports = recaptcha;