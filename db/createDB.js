const db = require('.').db;

console.log('Creando la tabla de usuarios...');
db.users.createCitextExtension()
.then( ()=>{
	console.log('Extensión citext creada.');
	return db.users.create();
}, error => console.log(`Error al crear extensión citext: ${error}`))
.then( ()=>{
	console.log('Tabla de usuarios creada');
})
.catch( error => console.error(`Error creando la tabla de usuarios : ${error}`) )
