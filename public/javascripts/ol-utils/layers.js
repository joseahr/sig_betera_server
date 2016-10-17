//Mapa base del IGN
function Tile(opts){
    return new ol.layer.Tile({
        name : opts.name,
        visible : true,
        source : new ol.source.TileWMS({
            url : opts.service_url,
            params: {
                'FORMAT': 'image/png', 
                'VERSION': '1.1.1',
                transparent : true,
                tiled : true, 
                LAYERS: opts.layers,
                STYLES: ''
            }
        })
    });
}
var ignBase = new ol.layer.Tile({
    name: 'IGN Base',
    visible: true,
    source: new ol.source.TileWMS({
        url: 'http://www.ign.es/wms-inspire/ign-base',
        params: {'FORMAT': 'image/png', 
                'VERSION': '1.1.1',
                transparent : false,
                tiled : true, 
                LAYERS: 'IGNBaseTodo',
                STYLES: '',
        }
    })
});

//Ortofoto PNOA
var ortoPNOA = new ol.layer.Tile({
    name: 'Ortofoto PNOA',
    visible: false,
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
    layers: [layerVectorVacia, ignBase, ortoPNOA]
});
