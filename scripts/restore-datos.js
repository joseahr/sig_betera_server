dbConfig =  {
    host: 'localhost',
    port: 5432,
    database: 'Datos',
    user: 'postgres',
    password : 'postgres'
};
const promiseLib = require('bluebird');
// Load and initialize pg-promise:
const pgp = require('pg-promise')( { promiseLib } );

// Create the database instance:
const db = pgp(dbConfig);

query = `
    SELECT table_name 
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('datos')
`;
console.log(query);
db.query(query)
.then(allTables =>{
    console.log(allTables)
    Promise.all([
        allTables.map(table => {
            
            return db.query(`
            INSERT INTO datos(gid, capa, id_user, fecha, url, descrip, size, nombre_user)
            SELECT gid::integer
                , '${table.table_name}'
                , 1
                , CAST(coalesce(NULLIF(fecha,''), now()::text) AS timestamp)
                , CASE WHEN url <> '' THEN url
                                     ELSE hipervinculo
                  END
                , NULLIF(descrip, '')
                , CAST(coalesce(NULLIF(size, ''), '0') AS integer)
                , NULLIF(usuario, '')
            FROM ${table.table_name}
            `)
        })
    ])
    .then(()=> console.log('Done'))
})
