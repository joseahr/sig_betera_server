const db = require('.').db;

/*
console.log('Creando la tabla de usuarios...');
//db.users.createCitextExtension()
Promise.resolve(null)
.then( ()=>{
	console.log('Extensión citext creada');
	//return db.users.createRolesEnum();
	return Promise.resolve(null);
})
.then( ()=>{
	console.log('Enum user_roles creado');
	return db.users.create();
})
.then( ()=>{
	console.log('Tabla de usuarios creada');
	//return db.users.layers.createTable();
	Promise.resolve(null);
})
.then( ()=>{
	console.log('Tabla de capas creada');
	//return db.users.roles.createEnum();
	return Promise.resolve(null);
})
.then( ()=>{
	console.log('Enum creado');
	return db.users.roles.createTable();
})
.then( ()=>{
	console.log('Tabla de roles creada');
})
.catch(console.log.bind(console));

*/

db.users.maps.createMapsTable()
//Promise.resolve(null)
.then( ()=>db.users.maps.createMapsUsersTable())
.then( ()=> db.users.maps.createMapsLayersTable())
.then(()=>console.log('done'))
.catch(console.error.bind(console))
