'use strict';

const sql = require('../sql').raster;

const jsts = require('jsts');

const WKTReader = jsts.io.WKTReader;

const reader = new WKTReader();

// #### Si quisiéramos obtener el perfil en otro Sistema de Referencia
// #### (El lineString que nos pasan no está en ETRS89)
// #### se podrían hacer dos cosas :
// #### 1.0 -> Usar ST_Transform() para reproyectar el raster --> Menos eficiente
// #### Reproyectar el lineString a 25830, obtener el LineString 3D, y reproyectarlo 
// #### al sistema de referencia deseado

const SRID = '25830'; // ETRS89 UTM H30
let getStep = length => length;


module.exports = (rep, pgp) => {

    return {
        getProfile : lineString =>{

            let geom;
            // Comprobar que es un lineString valido
            try {
                geom = reader.read(lineString);
                if (geom.getGeometryType() != 'LineString')
                    throw new Error('Debe pasar un LineString como parámetro');
            }
            catch(e){
                return Promise.reject('WKT no válido:' + e);
            }
            // Comprobar que está dentro de  los límites de Bétera

            // Obtener la longitud del lineString
            let length = geom.getLength();
            let step   = getStep(length);
            // Obtener el número de puntos a usar para obtener el perfil
            // de acuerdo a la longitud del lineString pasado
            return rep.one(sql.perfil, { wkt : `SRID=${SRID};${lineString}` })
        }
    };
};