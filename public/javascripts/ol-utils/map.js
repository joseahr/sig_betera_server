//Mapa base del IGN
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

var layerVectorVacia = new ol.layer.Vector({
    title:'Vacía',
    name: 'base'
});

var groupCapasBase = new ol.layer.Group({
    name: 'Capas Base',
    layers: [layerVectorVacia, ignBase, ortoPNOA]
});

var mousePositionControl25830 = new ol.control.MousePosition({
    coordinateFormat : ol.coordinate.createStringXY(3),
    target : $('#coords25830').get(0),
    className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
    projection : proyecciones['25830']
});

var mousePositionControl4258 = new ol.control.MousePosition({
    coordinateFormat : ol.coordinate.toStringHDMS,
    target : $('#coords4258').get(0),
    className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
    projection : proyecciones['4258']
});

var scaleLineControl = new ol.control.CanvasScaleLine();

var map = new ol.Map({
    layers 	: [
        groupCapasBase
    ],
    target 	: 'map',
    controls: ol.control.defaults({ attribution : false }).extend([
        scaleLineControl,
        mousePositionControl25830,
        mousePositionControl4258
    ]),
    view 	: new ol.View({
        projection: proyecciones['25830'],
        zoom 	  : 10,
        center 	  : [718235.466608, 4385207.688928]
    })
});

$('#map').hover(onHover, onHoverOut);

function onHover(){
    console.log('hiverin');
    $('.coords-scale-container').css('visibility', 'visible');
}

function onHoverOut(){
    $('.coords-scale-container').css('visibility', 'hidden');
}

map.addControl(new ol.control.LayerSwitcher({
    target : $('#layerSwitcher').get(0),
    oninfo : function(l){
        console.log(l);
    },
    extent : true,
    //trash  : true,
    onextent : function(l){
        map.getView().fit(l.getSource().getExtent(), map.getSize());
    }
}));