var db = require('.').db;

console.log('Creando la tabla de usuarios...');
db.users.create()
.then( ()=>{
	console.log('Tabla de usuarios creada');
})
.catch( error => console.error(`Error creando la tabla de usuarios : ${error}`) )
