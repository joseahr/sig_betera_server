'use strict';
const spawn = require('bluebird').promisify(require('child_process').exec)
const sql = require('../sql').layers;

module.exports = (rep, pgp) => {
    return {
        getFeaturesIntersecting : function(wkt, ...layers){
            return rep.task( t=>
                t.batch(
                    layers.map( layerName => 
                        this.getLayerSchema(layerName)
                        .then( schema =>{
                            // Obtenemos todas las columnas de la Tabla (schema)
                            let geomColumn = schema.find( col=> col.type === 'USER-DEFINED' && col.udt === 'geometry' ).name;
                            // Obtenemos la columna de Geometría (para ello nos fijamos en el udt_name)
                            let properties = schema.filter( col => col.name !== geomColumn ).map(col => col.name).join();
                            return rep.manyOrNone(
                                sql.getFeaturesIntersecting
                                , { wkt, geomColumn, properties, layerName }
                            ) 
                        })
                    )
                ).then(founds => founds.map( el => el[0] ))
            )
        },

        exist : tableName =>
            rep.one("SELECT EXISTS( SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName#}' )", { tableName })
            .then( result => result.exists ),

        importSHP : (shpPath, tableName) =>{
            //require('fs').readFile(`${shpPath}`, (err, file)=>console.log(err, file, 'guaa'));
            console.log(`export PGPASSWORD=postgres && shp2pgsql -I -W "LATIN1" ${shpPath} "capas"."${tableName}" | psql -d betera-test -U postgres`);
            return spawn(`export PGPASSWORD=postgres && shp2pgsql -I -s 25830 -W "LATIN1" ${shpPath} "capas"."${tableName}" | psql -d betera-test -U postgres`, { shell : true})
        },

        createTable : ()=>
            rep.none(sql.create),
        
        // GET TILE
        getTile : (layer, bbox)=>
            rep.one(),

        // Devuelvo el tipo de Geometría
        getLayerGeometryType : (layerName, geomColumn)=>
            rep.one(sql.getLayerGeometryType, {
                table : pgp.as.value(layerName),
                geomColumn : pgp.as.value(geomColumn)
            }, geometry => geometry.type),
        // Buscar por (id o name)
        findBy: (column, value) =>
            rep.oneOrNone(sql.findBy, {
                column: pgp.as.name(column),
                value: pgp.as.value(value)
            }),
        // Devuelve el ID y el nombre de una capa
        getLayerNames : (...ids) =>
            rep.manyOrNone(sql.getLayerNames, {
                ids
            }),


        // Obtener las columnas y el tipo de dato de una tabla
        getLayerSchema : tableName =>
            rep.many(sql.schema, {
                tableName : pgp.as.value(tableName)
            }),

        getAllLayers : () =>
            rep.manyOrNone(sql.getAllLayers),

        getAllBaseLayers : () =>
            rep.manyOrNone(sql.getAllBaseLayers),

        getBaseLayer : id_layer =>
            rep.one(sql.getBaseLayer, {
                id_layer : pgp.as.value(id_layer)
            }),
        // Obtener una capa como GeoJSON
        getLayerAsGeoJSON : function(layerName){
            return this.getLayerSchema(layerName)
            .then( schema =>{
                // Obtenemos todas las columnas de la Tabla (schema)
                let geomColumn = schema.find( col=> col.type === 'USER-DEFINED' && col.udt === 'geometry' ).name;
                // Obtenemos la columna de Geometría (para ello nos fijamos en el udt_name)
                let properties = schema.filter( col => col.name !== geomColumn );
                //console.log('geomColum :', geomColumn, 'properties :', properties)
                return rep.one(sql.getLayerAsGeoJSON, {
                    geomColumn : pgp.as.name(geomColumn),
                    properties : properties.map(prop => pgp.as.name(prop.name)).join(),
                    layerName
                })
                // Devolvemos un objeto 
                // {layerName : 'Nombre de la capa', layer : 'Capa en formato GeoJSON'}
                .then( layer =>{
                    return this.getLayerGeometryType(layerName, geomColumn)
                    .then(geomColumnType => ({ layerName, geomColumnType, layer : layer.result }))
                })
            })
        }
    };
};