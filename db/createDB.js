const db = require('.').db;

/*console.log('Creando la tabla de usuarios...');
db.users.createCitextExtension()
.then( ()=>{
	console.log('Extensión citext creada.');
	return db.users.create();
}, error => console.log(`Error al crear extensión citext: ${error}`))
.then( ()=>{
	console.log('Tabla de usuarios creada');
})
.catch( error => console.error(`Error creando la tabla de usuarios : ${error}`) )

*/

db.users.layers.createTable()
.then( ()=>{
	console.log('Tabla de capas creada');
	return db.users.roles.createEnum();
})
.then( ()=>{
	console.log('Enum creado');
	return db.users.roles.createTable();
})
.then( ()=>{
	console.log('Tabla de roles creada');
})
.catch(console.log.bind(console))
