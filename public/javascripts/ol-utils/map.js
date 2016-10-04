// http://stackoverflow.com/a/11381730/3866134
window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function updateSize(paddingPosition, paddingValue){
    if(paddingPosition == 'left' && $(window).innerWidth() < 993) return;
    $('#map').css('padding-' + paddingPosition, paddingValue);
    $('.coords-scale-container').css('margin-' + paddingPosition, paddingValue);
	map.updateSize();
}

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

// Control de Posición del ratón (Muestra las coords en EPSG:25830)
var mousePositionControl25830 = new ol.control.MousePosition({
    coordinateFormat : ol.coordinate.createStringXY(3),
    target : $('#coords25830').get(0),
    className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
    projection : proyecciones['25830']
});

// Control de Posición del ratón (Muestra las coords en EPSG:4258)
var mousePositionControl4258 = new ol.control.MousePosition({
    coordinateFormat : ol.coordinate.toStringHDMS,
    target : $('#coords4258').get(0),
    className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
    projection : proyecciones['4258']
});

// Control de Escala en Canvas del Mapa (ol3-ext)
var scaleLineControl = new ol.control.CanvasScaleLine();

// Instancia del mapa
var map = new ol.Map({
    layers 	: [ groupCapasBase ],
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

// Ocultamos/Mostramos los controles de MousePosition
// al hacer hover sobre el mapa
$('#map').on('mouseenter', onHover);
$('#map').on('mouseleave', onHoverOut);

// Función que se ejecuta cuando estamos encima del mapa
function onHover(){
    //console.log('hiverin');
    $('.coords-scale-container').css('visibility', 'visible');
}

// Función que se ejecuta cuando salimos del mapa
function onHoverOut(){
    $('.coords-scale-container').css('visibility', 'hidden');
}

// Instancia de la interacción de dibujar
var interactionDraw;
// Instancia de la interacción de modificar
var interactionModify;
// Interacción de Snap al dibujar / editar
var snapEditing;
// DataTable editar
var dataTableEdit;

// Añadimos el control de LayerSwitcher
map.addControl(new ol.control.LayerSwitcher({
    target : $('#layerSwitcher').get(0),
    oninfo : function(l){
        if(l.get('rol') !== 'e' && l.get('rol') !== 'd')
            return Materialize.toast('No tiene permisos para editar la capa ' + l.get('name'), 2500);
        // Si estamos editando previamente una capa salimos
        if(isEditingMode()) exitEditMode();
        // Actualizamos variable @layerInEditMode
        layerInEditMode = l;
        // Cerramos menú lateral
        $('.button-collapse').sideNav('hide');
        // Ponemos el zoom al mínimo para editar
        //console.log(map.getView().getZoom());
        if(map.getView().getZoom() < MIN_ZOOM_SHOW_LAYERS)
            map.getView().setZoom(MIN_ZOOM_SHOW_LAYERS);
        // Si la capa no está visible la ponemos visible
        map.once('postcompose', function(){
            //console.log(map.getView().getZoom());
            if(!l.getVisible()) l.setVisible(true);
        })

        // Desactivamos otros controles activos
        mainbar.getControls().forEach(function(co){
            if(co.name && co.getActive()){
                co.setActive(false);
                co.onToggle.call(co);
            }
        });

        $('#editar-container table thead').append(
            getTableHeader(
                l.getSource()
                .getFeatures()[0]
                .getProperties()
            )
        );
        
        // Mostramos las propiedades de cada feature de la capa en la extensión actual
        var mapExtent = map.getView().calculateExtent(map.getSize());
        l.getSource().forEachFeatureInExtent(mapExtent, function(f){
            //console.log(f.getProperties());
            $('#editar-container table tbody').append(getTableRow(f.getProperties()));
        });

        dataTableEdit = dataTableEdit  || $('#editar-container table').DataTable();

        $('<a href="#modal-editar">').leanModal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            opacity: 0, // Opacity of modal background
            in_duration: 300, // Transition in duration
            out_duration: 200, // Transition out duration
            starting_top: '4%', // Starting top style attribute
            ending_top: '10%', // Ending top style attribute
            ready: function() {
                updateSize('bottom', $('#modal-editar').innerHeight());
            }, // Callback for Modal open
            complete: function() {
                updateSize('bottom', '0px');
                exitEditMode();
            } // Callback for Modal close
        }).trigger('click');

        $('.lean-overlay').remove();

        l.getVisible(true);
        var geomColumnType = l.get('geomColumnType');
        interactionDraw = new ol.interaction.Draw({
            source : l.getSource(),
            type : (geomColumnType == 'MULTIPOLYGON' || geomColumnType == 'POLYGON'
                ? 'Polygon'
                : geomColumnType == 'MULTILINESTRING' || geomColumnType == 'LINESTRING'
                ? 'LineString'
                : 'Point')
        });
        /*interactionModify = new ol.interaction.Modify({
            features: l.getSource().getFeaturesCollection(),
            deleteCondition: function(event) {
            return /*ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
            }
        });
        */
        map.addInteraction(interactionDraw);
        //map.addInteraction(interactionModify);

        // The snap interaction must be added after the Modify and Draw interactions
        // in order for its map browser event handlers to be fired first. Its handlers
        // are responsible of doing the snapping.
        snapEditing = new ol.interaction.Snap({
            source: l.getSource()
        });
        map.addInteraction(snapEditing);
    },
    /*extent : true,
    trash  : true,
    onextent : function(l){
        map.getView().fit(l.getSource().getExtent(), map.getSize());
    }*/
}));

// Implementación petición HTTP usando Promises
// Usamos la librería Bluebird, para promisificar 
// métodos asíncronos
var XHRPromise = function(method, url){
    return new Bluebird(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status < 400) resolve(JSON.parse(xhr.responseText));
            else if(xhr.readyState === 4) reject(JSON.parse(xhr.responseText))
        };
        xhr.send(null);
    });
}

// Parser GeoJSON
var parser = new ol.format.GeoJSON();

/* Obtenemos los mapas del usuario 
   listOfMaps contendrá una lista con un objeto
   {
     id : (id_mapa), 
     mapName : (Nombre del mapa), 
     maplayerIds : [(lista con ids de las capas que conforman el mapa)]
   }
*/
XHRPromise('GET', '/usuarios/mapas')
.then(function(listOfMaps){
    // Recorremos la lista de mapas con reduce
    return listOfMaps.reduce(function(promise, mapa){
        // Creamos un grupo de capas
        // que contendrá todas las capas del mapa
        var groupCapasMap = new ol.layer.Group({
            name: mapa.mapName,
            format : new ol.format.GeoJSON(),
            visible : true
        });
        // Añadimos el grupo al mapa
        map.addLayer(groupCapasMap);

        // Encadenamos la promise anterior con la siguiente
        return promise.then(function(){
            // Utilizamos Promise.all para obtener todas las capas del mapa
            return Bluebird.all(
                // Recorremos la lista de ids de las capas con map
                mapa.maplayerIds.map(function(mlId){
                    // mlId es la id de una de las capas del mapa
                    // Enviamos una petición para obtener la capa en 
                    // formato GeoJSON
                    return XHRPromise('GET', '/usuarios/capas/' + mlId)
                    .then(function(capa){
                        // Obtenemos la capa en formato GeoJSON
                        // Llamamos a la función addCapa()
                        addCapa(capa, groupCapasMap);
                    })
                    .catch(function(error){
                        // Aquí debería ir un mensaje de error :/
                        // Se dispara si hay un error obteniendo una capa particular
                        console.log('La capa con id ' +  mlId + ' del mapa ' + mapa.mapName + ' no se ha podido cargar.');
                        console.log(error);
                        //alert(error);
                    });
                }) // mapa.maplayerIds.map(...)
            ) // Bluebird.all
        }) // promise.then(...)
        .then(function(){
            // Mostramos mensaje mapa cargado
            Materialize.toast('Mapa cargado : ' + mapa.mapName, 2500);
        })
    }, Bluebird.resolve(null) /* Valor inicial para reduce */)
}) // XHRPromise(...).then(...)
.catch(function(err){
    // Ha habido un error
    Materialize.toast('Error cargando los mapas : ', 2500);
    console.log(err);
    //alert(err);
});

// @capas : Almacena todos los ol.layer.Vector (capas) que añadimos
var capas = [];
// @capasQueTeniaVisibles : Almacena todos los ol.layer.Vector (capas) 
// que hay visibles cuando salimos del zoom aceptado para visualizar 
// ol.layer.Vector
var capasQueTeniaVisibles = [];
// @layerVisibilityChanged : Controla si hemos forzado una capa a que 
// no se muestre debido a que el nivel de zoom es bajo
var layerVisibilityChanged = false;
// @countLayersVisibilityChanged : Cuenta las capas que hemos forzado 
// a que no se muestren debido a que el nivel de zoom es bajo
var countLayersVisibilityChanged = 0;
// @MIN_ZOOM_SHOW_LAYERS : Sirve para controlar a qué zoom 
// se permiten ver las capas editables
var MIN_ZOOM_SHOW_LAYERS = 5;
// @layerInEditMode : Capa que se está editando
var layerInEditMode;
function isEditingMode (){
    console.log(layerInEditMode, layerInEditMode !== undefined);
    return layerInEditMode !== undefined;
}
// @exiEditMode (function) : Salir del modo edición
function exitEditMode(){
    map.removeInteraction(interactionDraw);
    map.removeInteraction(snapEditing);
    layerInEditMode = undefined;
}

map.on('postrender', function(){
    if(!layerInEditMode || !layerInEditMode.getVisible()) return;

    dataTableEdit.clear().draw();
    dataTableEdit = $('#edit-container table').DataTable();
    var mapExtent = map.getView().calculateExtent(map.getSize());
    var i = 0;
    layerInEditMode
    .getSource()
    .forEachFeatureInExtent(mapExtent, function(f){
        var obj = [];
        var props = f.getProperties();
        Object.keys(props).forEach(function(k){
            if(k != 'geometry') dataTableEdit.row.add(getTableRow(props).get(0));
        });
    });
    dataTableEdit.draw();
});

// Cuando cambia el Zoom del mapa
map.getView().on('change:resolution', function(){
    // Si el zoom es menor que @MIN_ZOOM_SHOW_LAYERS
    if(map.getView().getZoom() < MIN_ZOOM_SHOW_LAYERS){
        // Recorremos nuestras capas editables
        capas.forEach(function(c, i){
            // Si alguna está visible
            if (c.getVisible()){
                // Añadimos esa capa a la lista @capasQueTeniaVisibles
                capasQueTeniaVisibles.push(c);
                // actualizamos el contador de capas forzadas a ocultarse
                countLayersVisibilityChanged++;
                // Función para que se ejecute en el siguiente
                // tick del event-loop
                var func = function(){
                    // Ponemos a true la variable layerVisibilityChanged
                    layerVisibilityChanged = true;
                    // Pasamos a no visible la capa
                    c.setVisible(false);
                }
                // Ejecutamos la función en el siguiente tick del event-loop
                setTimeout(func, 0);
            }
        });
    } else {
        // El zoom es mayor o igual a @MIN_ZOOM_SHOW_LAYERS
        // Recorremos la lista @capasQueTeniaVisibles
        capasQueTeniaVisibles.forEach(function(c){
            // Ponemos a visible dichas capas
            c.setVisible(true);
        });
        // Modificamos la variable @capasQueTeniaVisibles
        // a una lista vacía
        //console.log('Modificar capasQueTeniaVisibles a []');
        capasQueTeniaVisibles = [];
    }
});

// Función para añadir una capa recibida del server
// como GeoJSON a un grupo de capas
function addCapa(capa, group){
    // console.log(capa.geomColumnType, 'capa');
    if(typeof capa === 'string'){
        // De momento no hacemos nada pero si el server nos 
        // devuelve un string es que no tenemos permisos para
        // editar o eliminar features en una capa
        return;
    }
    //console.log('Añadiendo capa:', capa.layerName, 'al grupo: ', group.get('name'));
    var layerType = capa.geomColumnType;
    var getGeometry = function(layerType){
        layerType = layerType.toLowerCase();
        switch(layerType){
            case 'multilinestring':
            case 'linestring': return 'LineString';
            case 'multipolygon':
            case 'polygon': return 'Polygon';
            default : return 'Point';
        }
    }
    // @ol.layer.Vector que almacenará las features de la capa
    var vector = new ol.layer.Vector({
        name : capa.layerName,
        geomColumnType : getGeometry(layerType),
        rol  : capa.rol,
        visible : false,
        opacity : 0,
        //displayInLayerSwitcher : false,
        strategy : ol.loadingstrategy.bbox,
        source : new ol.source.Vector({
            // Ponerlo en false para obtener FeatureCollection en 
            // la interacción Modify. Con esto puesto en true, el 
            // método source.getFeaturesCollection() devolverá null
            // Esto implica un menor rendimiento con un número grande de features
            //useSpatialIndex : false,
            features : parser.readFeatures(capa.layer)
        })
    });

    // Le damos un listener a la capa, para cuando cambie su
    // visibilidad
    vector.on('change:visible', function(e){
        // La capa ha sido forzada a que no se visulize
        if(layerVisibilityChanged){
            // cambiamos el estado de la variable a false
            layerVisibilityChanged = false;
            // Si el número de veces que se ha disparado este evento coincide con 
            // el tamaño de la lista de capasQueTeniaVisibles mostramos un mensaje informativo
            // de que no puedes visualizar las capas a un zoom tan bajo
            if (countLayersVisibilityChanged >= capasQueTeniaVisibles.length && capasQueTeniaVisibles.length){
                // Modificamos la variable @countLayersVisibilityChanged a 0
                countLayersVisibilityChanged = 0;
            }
            // No seguimos
            return;
        }

        // La capa no ha sido forzada a que no se visualice
        // ha sido el usuario dándole click al checkbox del LayerSwitcher
        // Si el zoom es menor que @MIN_ZOOM_SHOW_LAYERS
        if(this.getVisible && map.getView().getZoom() < MIN_ZOOM_SHOW_LAYERS){
            // Ponemos @layerVisibilityChanged a true para decir que hemos forzado
            // a ocultar la capa
            layerVisibilityChanged = true;
            // La ocultamos
            this.setVisible(false);
            // Decimos que a este zoom no se puede mostrar la capa
            Materialize.toast('Zoom demasiado bajo para ver la capa', 1000);
        }
    }); // Fin vector.on(...)
    
    // Añadimos la capa a la lista de capas
    capas.push(vector);
    // Añadimos la capa al grupo
    group.getLayers().extend([vector]);

    // Movemos ciertas capas arriba del todo 
    // estas capas son las que se usan en las herramientas de
    // perfil y medición (No se mostrarán en el LayerSwitcher)
    map.getLayers().forEach(function(l, i){
        if(l.get('name') == 'Perfil LineStringZ' || l.get('name') == 'vector medir'){
            map.getLayers().getArray().splice(i, 1);
            map.getLayers().getArray().push(l);
        }
    });
} // Fin addCapa()

function getTableRow(obj){
    var tr = $('<tr>');
    Object.keys(obj).map(function(k){
        if(k == 'geometry' || k == 'layerName') return;
        $('<td>').html(obj[k]).appendTo(tr); 
    });
    return tr;
}

function getTableHeader(obj){
    var tr = $('<tr>');
    Object.keys(obj).map(function(k){
        if(k == 'geometry' || k == 'layerName') return;
        $('<th>').html(k).appendTo(tr); 
    });
    return tr;  
}

/*********************** SELECT FEATURES */

var sourceSelectedFeatures = new ol.source.Vector();
var selectedFeatures = new ol.layer.Vector({
    source : sourceSelectedFeatures,
    name : 'features selected'
});
map.addLayer(selectedFeatures);

if (!mobileAndTabletcheck()){
    map.on('pointermove', handleSelect);
} else {
    map.on('click', handleSelectClick);
}

function handleSelectClick(e){
    var hayFeatures = false;
    sourceSelectedFeatures.clear();
    capas.forEach(function(c){
        var source = c.getSource();
        var features = source.getFeaturesAtCoordinate(e.coordinate);
        //console.log(c.get('geomColumnType'));
        if(!features.length && (c.get('geomColumnType') === 'LineString' || c.get('geomColumnType') === 'Point') ){
            var feature = source.getClosestFeatureToCoordinate(e.coordinate);
            //console.log(c.get('geomColumnType'), 'No features At coordinate', feature);
            if(feature){
                var ext = feature.getGeometry().getExtent();
                var cc = ol.extent.getCenter(ext);
                var distance = c.get('geomColumnType') === 'Point' 
                    ? ol.sphere.WGS84.haversineDistance(
                        ol.proj.transform(e.coordinate, 'EPSG:25830', 'EPSG:4326'),
                        ol.proj.transform(cc, 'EPSG:25830', 'EPSG:4326') 
                    )
                    : ol.sphere.WGS84.haversineDistance(
                        ol.proj.transform(feature.getGeometry().getClosestPoint(e.coordinate), 'EPSG:25830', 'EPSG:4326'),
                        ol.proj.transform(e.coordinate, 'EPSG:25830', 'EPSG:4326')
                    ); 
                if(distance < 0.5) {
                    hayFeatures = true;
                    feature.set('layerName', c.get('name'));
                    sourceSelectedFeatures.addFeature(feature);
                    map.getTargetElement().style.cursor = 'pointer';
                }
                //console.log(c.get('name'), distance);
            }
            // Calcular la distancia
        }
        else if(features.length){
            hayFeatures = true;
            //console.log(c.get('name'), features);
            map.getTargetElement().style.cursor = 'pointer';
            features.forEach(function(f){
                f.set('layerName', c.get('name'));
                sourceSelectedFeatures.addFeature(f);
            })
        }
    });

    if(!hayFeatures) return;
    $('#modal-feature table').empty();
    sourceSelectedFeatures.forEachFeature(function(f){
        var props = f.getProperties();
        var layerName = f.get('layerName');
        $('#modal-feature table')
        .append('<tr><td class="card-panel" style="background : rgba(48,63,159, 0.3); color : #fff;">' + layerName + '</td></tr>')
        .append('<tr style="height : 5px;"></tr>')
        .append(getTableHeader(props))
        .append(
            getTableRow(props)
            .hover(function(){
                this.style.cursor = 'pointer';
                this.style.background = 'rgba(48,63,159, 0.3)';
                this.style.color = '#fff';
                sourceSelectedFeatures.clear();
                sourceSelectedFeatures.addFeature(f);
            }, function(){
                this.style.color = '#000';
                this.style.background = '#fff';
                sourceSelectedFeatures.clear();
            })
            .click(function(){
                var extent = f.getGeometry().getExtent();
                map.getView().fit(extent, map.getSize());
            })
        )
        .append('<tr style="height : 5px;"></tr>');
    });
    $('<a href="#modal-feature">').leanModal({
        complete : function(){
            updateSize('bottom', '0px');
        }
    }).trigger('click');
    $('.lean-overlay').remove();
    updateSize('bottom', $('#modal-feature').innerHeight());
}

function handleSelect(e){
    sourceSelectedFeatures.clear();
    var listenerClick = map.once('click', function(){
        if(!sourceSelectedFeatures.getFeatures().length) return;
        $('#modal-feature table').empty();
        sourceSelectedFeatures.forEachFeature(function(f){
            var props = f.getProperties();
            var layerName = f.get('layerName');
            $('#modal-feature table')
            .append('<tr><td class="card-panel" style="background : rgba(48,63,159, 0.3); color : #fff;">' + layerName + '</td></tr>')
            .append('<tr style="height : 5px;"></tr>')
            .append(getTableHeader(props))
            .append(
                getTableRow(props)
                .hover(function(){
                    this.style.cursor = 'pointer';
                    this.style.background = 'rgba(48,63,159, 0.3)';
                    this.style.color = '#fff';
                    sourceSelectedFeatures.clear();
                    sourceSelectedFeatures.addFeature(f);
                }, function(){
                    this.style.color = '#000';
                    this.style.background = '#fff';
                    sourceSelectedFeatures.clear();
                })
                .click(function(){
                    var extent = f.getGeometry().getExtent();
                    map.getView().fit(extent, map.getSize());
                })
            )
            .append('<tr style="height : 5px;"></tr>');
        });

        $('<a href="#modal-feature">').leanModal({
            complete : function(){
                updateSize('bottom', '0px');
            }
        }).trigger('click');
        $('.lean-overlay').remove();
        updateSize('bottom', $('#modal-feature').innerHeight());
    });

    var hayFeatures = false;
    capas.forEach(function(c){
        var source = c.getSource();
        var features = source.getFeaturesAtCoordinate(e.coordinate);
        //console.log(c.get('geomColumnType'));
        if(!features.length && (c.get('geomColumnType') === 'LineString' || c.get('geomColumnType') === 'Point') ){
            var feature = source.getClosestFeatureToCoordinate(e.coordinate);
            //console.log(c.get('geomColumnType'), 'No features At coordinate', feature);
            if(feature){
                var ext = feature.getGeometry().getExtent();
                var cc = ol.extent.getCenter(ext);
                var distance = c.get('geomColumnType') === 'Point' 
                    ? ol.sphere.WGS84.haversineDistance(
                        ol.proj.transform(e.coordinate, 'EPSG:25830', 'EPSG:4326'),
                        ol.proj.transform(cc, 'EPSG:25830', 'EPSG:4326') 
                    )
                    : ol.sphere.WGS84.haversineDistance(
                        ol.proj.transform(feature.getGeometry().getClosestPoint(e.coordinate), 'EPSG:25830', 'EPSG:4326'),
                        ol.proj.transform(e.coordinate, 'EPSG:25830', 'EPSG:4326')
                    ); 
                if(distance < 0.5) {
                    hayFeatures = true;
                    feature.set('layerName', c.get('name'));
                    sourceSelectedFeatures.addFeature(feature);
                    map.getTargetElement().style.cursor = 'pointer';
                }
                //console.log(c.get('name'), distance);
            }
            // Calcular la distancia
        }
        else if(features.length){
            hayFeatures = true;
            //console.log(c.get('name'), features);
            map.getTargetElement().style.cursor = 'pointer';
            features.forEach(function(f){
                f.set('layerName', c.get('name'));
                sourceSelectedFeatures.addFeature(f);
            })
        }
    });
    sourceSelectedFeatures.changed();
    if(!hayFeatures) {
        map.un(listenerClick);
        map.getTargetElement().style.cursor = 'auto';
        //sourceSelectedFeatures.clear();
    }
    //alert(hayFeatures);
}

/*
// select interaction working on "pointermove"
var selectPointerMove = new ol.interaction.Select({
  condition: mobileAndTabletcheck() ? ol.events.condition.click : ol.events.condition.pointerMove , 
  layers : capas,
  filter : function(feature, layer){
      //console.log(layer.get('name'), feature);
      selected = feature;
      layerSelected = layer;
      return true;
  }
});

var selected = null;
var layerSelected = null;
selectPointerMove.on('select', function(e){
    if(!e.selected || !e.selected.length) {
        map.getTargetElement().style.cursor = 'auto';
        selected = null;
        layerSelected = null;
        return;
    }
    map.getTargetElement().style.cursor = 'pointer';
});

map.on('click', function(e){
    var controlsEnabled = false;
    mainbar.getControls().forEach(function(c){
        if(c.getActive && c.getActive()) controlsEnabled = true;
    });

    if(controlsEnabled) return;
    if(selected) {
        console.log(selected);
        var props = selected.getProperties();
        $('#modal-feature table')
        .empty()
        .append(getTableHeader(props))
        .append(getTableRow(props));

        $('<a href="#modal-feature">').leanModal({
            complete : function(){
                updateSize('bottom', '0px');
            }
        }).trigger('click');
        $('.lean-overlay').remove();
        updateSize('bottom', $('#modal-feature').innerHeight());

        $('#modal-feature .modal-header h4').html('Información - Capa : ' + layerSelected.get('name') )
    }
});


map.addInteraction(selectPointerMove);

*/