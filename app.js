// Framework express
const express = require('express');
// Módulo path (Nativo de NodeJS)
const path = require('path');
// favicon
const favicon = require('serve-favicon');
// un logger de peticiones
const logger = require('morgan');
// Necesario para parsears las cookies
const cookieParser = require('cookie-parser');
// Necesario para parsear el cuerpo de la petición
const bodyParser = require('body-parser');
// librería passport
const passport = require('passport');
// librería express-session
const expressSession = require('express-session');

// Rutas de la aplicación
const routes = require('./routes/index');
const users = require('./routes/users');
const raster = require('./routes/raster');
const maps = require('./routes/maps');
const layers = require('./routes/layers');
const admin = require('./routes/admin');

// Objeto app express
const app = express();

//app.enable('trust proxy');

// Motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Da seguridad a nuestra aplicación express
app.use(require('helmet')());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración passport

//Primero usamos la propia sesión de express
app.use(expressSession({secret: 'mySecretKey', resave : true, saveUninitialized : true}));
app.use(passport.initialize());
// Luego las sesiones de passport
app.use(passport.session());
// Pasamos el objeto passport para pasarle las estrategias de autenticación y registro
require('./passport')(passport);

app.set('trust proxy', true) // specify a single subnet

app.use((req, res, next)=>{
  if(req.user){
    let user = Object.keys(req.user).reduce((o,k)=>{
      if(k !== 'password') o[k] = req.user[k];
      return o;
    }, {});
    res.locals.user = user;
  }
  next();
});

app.use('/', routes);
app.use('/usuarios', users);
app.use('/raster', raster);
app.use('/usuarios/mapas', maps);
app.use('/usuarios/capas', layers);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
