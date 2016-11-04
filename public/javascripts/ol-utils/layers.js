//Mapa base del IGN
function Tile(opts){
    return new ol.layer.Tile({
        name : opts.name,
        wms_externo : options.wms_externo,
        visible : true,
        source : new ol.source.TileWMS({
            url : opts.service_url,
            gutter : options.gutter <= 0 ? 0 : 250,
            //crossOrigin: options.crossOrigin || 'anonymous', // Configurar Geoserver para orígenes remotos primero
            //crossOrigin : 'anonymous',
            params: {
                'FORMAT': 'image/png', 
                'VERSION': '1.1.1',
                'TRANSPARENT' : true,
                'TILED' : true, 
                LAYERS: opts.layers,
                STYLES: ''
            }
        })
    });
}

var mdt25 = new ol.layer.Tile({
    name: 'IGN MDT 25M',
    visible: false,
    source: new ol.source.TileWMS({
        url: 'http://www.ign.es/wms-inspire/mdt',
        crossOrigin: 'anonymous',
        params: {'FORMAT': 'image/png', 
                'VERSION': '1.1.1',
                transparent : false,
                tiled : true, 
                LAYERS: 'EL.GridCoverage',
                STYLES: '',
        }
    })
});

//Ortofoto PNOA
var ortoPNOA = new ol.layer.Tile({
    name: 'Ortofoto PNOA',
    visible: true,
    source: new ol.source.TileWMS({
        url: 'http://www.ign.es/wms-inspire/pnoa-ma',
        crossOrigin: 'anonymous',
        params: {'FORMAT': 'image/png', 
                'VERSION': '1.1.1',
                tiled: true,
                LAYERS: 'OI.OrthoimageCoverage',
                STYLES: '',
        }
    })
});

// Capa vacía
var layerVectorVacia = new ol.layer.Vector({
    title:'Vacía',
    name: 'base'
});

// Grupo de capas Base
var groupCapasBase = new ol.layer.Group({
    name: 'Capas Base',
    defaultLayers : true,
    baseLayer : true,
    layers: [layerVectorVacia, mdt25, ortoPNOA]
});
