// Librería nodemailer
const nodemailer = require('nodemailer');
// Para "promisificar" transporter.sendMail(options, callback)
const bluebird = require('bluebird');

// create reusable transporter object using the default SMTP transport
const urlTransport = require('../config').mailer;
const transporter = nodemailer.createTransport(urlTransport);

// Nombre del destinatario
const from = '"SIG Bétera 👥" <topografo@betera.es>';

// Promisificamos transporter.sendMail(options, callback)
// Ahora podemos usarla como sendMail(options).then(...).catch(...)
const sendMail = bluebird.promisify(transporter.sendMail.bind(transporter));

// Enviar un e-mail cuyo cuerpo va renderizar un HTML
// Ejemplo de uso : sendHTMLMailTo(subject, html, email1, email2, email3, ..., emailN)
const sendHTMLMailFrom = from =>{
    return (subject, html, ...destinators) => sendMail({from, subject, html, to : destinators.join()});
}
const sendHTMLMailTo = (subject, html, ...destinators)=>{
    let to = destinators.join();
    return sendMail({from, subject, html, to});
}

// Enviar un email cuyo cuerpo va a ser texto plano
const sendTextMailTo = (subject, text, ...destinators)=>{
    let to = destinators.join();
    return sendMail({from, subject, text, to});
}

//var mailOptions = {
//    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
//    to: 'joherro3@topo.upv.es', // list of receivers
//    subject: 'Hello ✔', // Subject line
//    text: 'Hello world 🐴', // plaintext body
//    html: '<b>Hello world 🐴</b>' // html body
//};

const defaultMessages = {
    forgotPassword : {
        subject : name => `Hola, ${name}, recupera tu contraseña.`,
        content : (nombre, apellidos, token) => `
            Hola, ${nombre} ${apellidos}, usted ha pedido cambiar su contraseña.<br>
            Para recuperar su cuenta, por favor, diríjase a la siguiente dirección<br>
            <a href="http://localhost:3000/usuarios/password/${token}">http://localhost:3000/usuarios/password/${token}</a>
        `
    }
};

// Exportamos las dos funciones creadas y el objeto transporter
//  por si hiciera falta
module.exports = {
    transporter,
    sendHTMLMailFrom,
    sendHTMLMailTo,
    sendTextMailTo,
    defaultMessages
}
