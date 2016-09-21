'use strict';

const sql = require('../sql').layers;

module.exports = (rep, pgp) => {

    return {
        createTable : ()=>
            rep.none(sql.create),
        // Obtener las columnas y el tipo de dato de una tabla
        getLayerSchema : tableName =>
            rep.many(sql.schema, {
                tableName : pgp.as.value(tableName)
            }),
        getLayerAsGeoJSON : function(layerName){
            return this.getLayerSchema(layerName)
            .then( schema =>{
                let geomColumn = schema.find( col=> (col.name === 'the_geom' || col.name === 'geom') && col.type === 'USER-DEFINED' );
                let properties = schema.filter( col => col.name !== geomColumn.name );
                return rep.one(sql.getLayerAsGeoJSON, {
                    geomColumn : pgp.as.name(geomColumn.name),
                    properties : properties.map(prop => pgp.as.name(prop.name)).join(),
                    layerName
                })
            })
        }
    };
};