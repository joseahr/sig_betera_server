'use strict';

const sql = require('../sql').layers;

module.exports = (rep, pgp) => {
    return {
        createTable : ()=>
            rep.none(sql.create),


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
        // Obtener una capa como GeoJSON
        getLayerAsGeoJSON : function(layerName){
            return this.getLayerSchema(layerName)
            .then( schema =>{
                // Obtenemos todas las columnas de la Tabla (schema)
                let geomColumn = schema.find( col=> col.type === 'USER-DEFINED' && col.udt === 'geometry' );
                // Obtenemos la columna de Geometría (para ello nos fijamos en el udt_name)
                let properties = schema.filter( col => col.name !== geomColumn.name );
                //console.log('geomColum :', geomColumn, 'properties :', properties)
                return rep.one(sql.getLayerAsGeoJSON, {
                    geomColumn : pgp.as.name(geomColumn.name),
                    properties : properties.map(prop => pgp.as.name(prop.name)).join(),
                    layerName,
                })
                // Devolvemos un objeto 
                // {layerName : 'Nombre de la capa', layer : 'Capa en formato GeoJSON'}
                .then( layer => ({ layerName, layer : layer.result }))
            })
        }
    };
};