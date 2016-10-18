'use strict';

const sql = require('../sql').maps;

module.exports = (rep, pgp) => {
    return {
        getOrder : id =>
            rep.any(sql.getOrder, { id_map : pgp.as.value(id_map) }),
        // Crea la tabla de mapas
        createMapsTable : ()=> rep.none(sql.createMapsTable),
        // Crea la tabla de mapas-users
        createMapsUsersTable : ()=> rep.none(sql.createMapsUsersTable),
        // Crea la tabla maps-layers
        createMapsLayersTable : ()=> rep.none(sql.createMapsLayersTable),
        // Comprobar si un usuario tiene asignado un mapa 
        hasMap : (id_user, id_map)=>
            rep.one(sql.hasMap, {
                id_user : pgp.as.value(id_user),
                id_map : pgp.as.value(id_map)
            }, hasMap => hasMap.exists),
        // Obtener los mapas de un usuario
        // Devuelve una lista que contiene los ids de los mapas
        getMaps : id_user =>
            rep.any(sql.getMaps, {
                id_user : pgp.as.value(id_user)
            }),

        getDefaultMaps : () =>
            rep.any(sql.getDefaultMaps),
        // Obtener el nombre de todos los mapas
        getMapNames : (...ids)=> 
            rep.manyOrNone(sql.getMapNames, {ids})
            .then(mapNames => mapNames.length ? mapNames : undefined),
        getAllMaps : ()=>
            rep.any(sql.getAllMaps),
        // Obtener las capas que conforman un mapa
        // Devuelve una lista con las ids de las capas
        getLayers : (id_map)=> 
            rep.manyOrNone(sql.getLayers, { id_map : pgp.as.value(id_map) })
            .then(layers => layers.length ? layers.map(l => l.id_layer) : undefined),

        getBaseLayers : (id_map)=> 
            rep.manyOrNone(sql.getBaseLayers, { id_map : pgp.as.value(id_map) })
            .then(layers => layers.length ? layers.map(l => l.id_base_layer) : undefined),
        // Obtener las capas de un usuario que necesitan darse permisos
        // Por ejemplo : Un usuario se le asigna un mapa
        // En ciertas capas del mapa puede no tener permisos de lectura
        // y habría que dárselos para que pudiera ver la capa
        getMapsAndLayers : function(id_user){
            let promise = id_user
                ? this.getMaps(id_user)
                : this.getDefaultMaps();
            return promise
            .then(listOfMaps =>{
                if(!listOfMaps) return Promise.resolve(null);
                return rep.tx( t =>{
                    console.log(listOfMaps);
                    return t.batch(listOfMaps.map( m => m.id ).map(this.getLayers))
                })
                .then(mapLayers =>{
                    return rep.tx( t =>{
                        return t.batch(listOfMaps.map( m => m.id ).map(this.getBaseLayers))
                    })
                    .then(mapBaseLayers =>{
                        return listOfMaps.reduce( (arr, map, idx) =>{
                            let obj = { id : map.id, mapName : map.name, maplayerIds : mapLayers[idx], orden : map.orden };
                            obj['mapbaselayerIds'] = mapBaseLayers[idx] 
                                ? mapBaseLayers[idx] 
                                : [];
                            arr.push(obj);
                            return arr;
                        }, []);
                    });              
                })

            })
        }
    };
};