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
$('#map').hover(onHover, onHoverOut);

// Función que se ejecuta cuando estamos encima del mapa
function onHover(){
    console.log('hiverin');
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

// Añadimos el control de LayerSwitcher
map.addControl(new ol.control.LayerSwitcher({
    target : $('#layerSwitcher').get(0),
    oninfo : function(l){
        // Si estamos editando previamente una capa salimos
        if(isEditingMode()) exitEditMode();
        // Actualizamos variable @layerInEditMode
        layerInEditMode = l;
        // Cerramos menú lateral
        $('.button-collapse').sideNav('hide');
        // Ponemos el zoom al mínimo para editar
        console.log(map.getView().getZoom());
        if(map.getView().getZoom() < MIN_ZOOM_SHOW_LAYERS)
            map.getView().setZoom(MIN_ZOOM_SHOW_LAYERS);
        // Si la capa no está visible la ponemos visible
        map.once('postcompose', function(){
            console.log(map.getView().getZoom());
            if(!l.getVisible()) l.setVisible(true);
        })

        // Desactivamos otros controles activos
        mainbar.getControls().forEach(function(co){
            if(co.name && co.getActive()){
                co.setActive(false);
                co.onToggle.call(co);
            }
        });

        $('#editar-container table').append(
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
            $('#editar-container table').append(getTableRow(f.getProperties()));
        });

        $('<a href="#modal-editar">').leanModal().trigger('click');
        $('.lean-overlay').remove();

        if(l.get('rol') !== 'e' && l.get('rol') !== 'd')
            return Materialize.toast('No tiene permisos para editar la capa ' + l.get('name'), 2500);
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
var MIN_ZOOM_SHOW_LAYERS = 15;
function getZoomLevel(length){
    if(length >= 2000) return 15;
    if(length >= 1000) return 13;
    return 0;
}
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

    $('#editar-container table').empty().append(getTableHeader(layerInEditMode.getSource().getFeatures()[0].getProperties()));  
    
    var mapExtent = map.getView().calculateExtent(map.getSize());

    layerInEditMode
    .getSource()
    .forEachFeatureInExtent(mapExtent, function(f){
        $('#editar-container table').append(getTableRow(f.getProperties()));
    });
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
                if(map.getView().getZoom() < getZoomLevel(c.getSource().getFeatures().length))
                    setTimeout(func, 0);
                else 
                    Materialize.toast('Zoom demasiado bajo para la capa : ' + c.get('name'), 2500);
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
        console.log('Modificar capasQueTeniaVisibles a []');
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
    
    // @ol.layer.Vector que almacenará las features de la capa
    var vector = new ol.layer.Vector({
        name : capa.layerName,
        geomColumnType : capa.geomColumnType,
        rol  : capa.rol,
        visible : false,
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

    vector.getSource().forEachFeature(function(f){
        /*var properties = f.getProperties();
        console.log('0', f.getProperties());
        Object.keys(properties).forEach(function(p){
            delete properties[p];
        });
        console.log('1', f.getProperties());*/
        f.getGeometry().simplify(0.1);
    });

    // Le damos un listener a la capa, para cuando cambie su
    // visibilidad
    vector.on('change:visible', function(e){
        var MIN_ZOOM = getZoomLevel(this.getSource().getFeatures().length);
        console.log(MIN_ZOOM, this.getSource().getFeatures().length);
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
        if(this.getVisible && map.getView().getZoom() < MIN_ZOOM){
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
        if(k == 'geometry') return;
        $('<td>').html(obj[k]).appendTo(tr); 
    });
    return tr;
}

function getTableHeader(obj){
    var tr = $('<tr>');
    Object.keys(obj).map(function(k){
        if(k == 'geometry') return;
        $('<th>').html(k).appendTo(tr); 
    });
    return tr;  
}