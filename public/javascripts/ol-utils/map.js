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

var interactionDraw;
var interactionModify;
map.addControl(new ol.control.LayerSwitcher({
    target : $('#layerSwitcher').get(0),
    oninfo : function(l){
        l.getSource().forEachFeature(function(f){
            var fn = function(){
                //console.log('props', f.getProperties().gid);
            }
            window.setTimeout(fn, 0);
        });
        if(l.get('rol') !== 'e' && l.get('rol') !== 'd')
            return Materialize.toast('No tiene permisos para editar la capa ' + l.get('name'), 2500);
        l.getVisible(true);
        var geomColumnType = l.get('geomColumnType');
        interactionDraw = new ol.interaction.Draw({
            source : l.getSource(),
            type : (geomColumnType == 'MULTIPOLYGON' 
                ? 'Polygon'
                : geomColumnType == 'MULTILINESTRING'
                ? 'LineString'
                : 'Point')
        });
        interactionModify = new ol.interaction.Modify({
            features: l.getSource().getFeaturesCollection(),
            deleteCondition: function(event) {
            return /*ol.events.condition.shiftKeyOnly(event) &&*/ ol.events.condition.singleClick(event);
            }
        });
        map.addInteraction(interactionDraw);
        map.addInteraction(interactionModify);
    },
    /*extent : true,
    trash  : true,
    onextent : function(l){
        map.getView().fit(l.getSource().getExtent(), map.getSize());
    }*/
}));