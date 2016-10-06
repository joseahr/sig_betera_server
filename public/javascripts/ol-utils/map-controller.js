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

function MapController(){

    var self = this;

    // @layers : Almacena todos los ol.layer.Vector (capas) que añadimos
    this.layers = [];
    // @capasQueTeniaVisibles : Almacena todos los ol.layer.Vector (capas) 
    // que hay visibles cuando salimos del zoom aceptado para visualizar 
    // ol.layer.Vector
    this.capasQueTeniaVisibles = [];
    // @layerVisibilityChanged : Controla si hemos forzado una capa a que 
    // no se muestre debido a que el nivel de zoom es bajo
    this.layerVisibilityChanged = false;
    // @countLayersVisibilityChanged : Cuenta las capas que hemos forzado 
    // a que no se muestren debido a que el nivel de zoom es bajo
    this.countLayersVisibilityChanged = 0;
    // @MIN_ZOOM_SHOW_LAYERS : Sirve para controlar a qué zoom 
    // se permiten ver las capas editables
    this.MIN_ZOOM_SHOW_LAYERS = 5;

    // http://stackoverflow.com/a/11381730/3866134
    this.mobileAndTabletcheck = function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };
    
    this.sourceSelectedFeatures = new ol.source.Vector();
    this.selectedFeatures = new ol.layer.Vector({
        source : this.sourceSelectedFeatures,
        name : 'features selected',
        displayInLayerSwitcher : false
    });

    // http://epsg.io/
	proj4.defs("EPSG:4258","+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
	proj4.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

    this.projections = {
        "4258"  : ol.proj.get('EPSG:4258'),
        "25830" : ol.proj.get('EPSG:25830')
    };
  
    this.bounds = [-138355.310720, 4097656.744290, 1145625.043311, 4831391.211958];

    this.center = [718235.466608, 4385207.688928];

    this.zoom = 10;
  
	this.projection = this.projections["25830"];
    this.projection.setExtent(this.bounds);
  
	this.view = new ol.View({
  	    projection : this.projection,
  	    zoom 	     : 10,
  	    center 	   : [718235.466608, 4385207.688928]
    });

    this.map = new ol.Map({
        preload : Infinity,
        layers 	: [ groupCapasBase, this.selectedFeatures],
        target 	: 'map',
        controls: ol.control.defaults({ attribution : false }),
        view 	: this.view
    });

    this.updateSize = function updateSize(paddingPosition, paddingValue){
        if(paddingPosition == 'left' && $(window).innerWidth() < 993) return;
        $('#map').css('padding-' + paddingPosition, paddingValue);
        if(paddingPosition == 'left')
            $('.modal').css('padding-left', paddingValue);
        $('#map').trigger('sizeupdated');
        //$('.coords-scale-container').css('margin-' + paddingPosition, paddingValue);
        this.map.updateSize();
        this.map.changed();
        this.map.render();
    }

    this.geolocation = new ol.Geolocation({
        projection: this.map.getView().getProjection(),
        trackingOptions: {
            maximumAge: 10000,
            enableHighAccuracy: true,
            timeout: 600000
        }
    });
    this.map.addControl(new ol.control.MousePositionBetera({ mapController : this }));
    this.map.addControl(new ol.control.SideMenu({ mapController : this }));
    this.mainbar = new ol.control.Bar();
    MeasureControl(this);
    SelectControl(this);
    PerfilControl(this);
    GeolocationControl(this);
    this.map.addControl(this.mainbar);
    this.map.addControl(new ol.control.FullScreen({
        source: $('body').get(0)
    }));

    this.map.addControl(new ol.control.CanvasScaleLine());
    //$('.ol-scale-line').css('left', 'auto');
    $('.ol-scale-line').css('left', '4.5em');
    $('.ol-scale-line').css('bottom', '0.5em');
	this.map.render();

    // Añadimos el control de LayerSwitcher
    this.map.addControl(new ol.control.LayerSwitcher({
        target : $('#layerSwitcher').get(0),
        /*extent : true,
        trash  : true,
        onextent : function(l){
            map.getView().fit(l.getSource().getExtent(), map.getSize());
        }*/
    }));

    var paddingLeft;
    this.mobileAndTabletcheck()
        ? paddingLeft = '0px'
        : paddingLeft = '300px';
    this.map.getTargetElement().style['padding-left'] = paddingLeft;
    this.updateSize('left', paddingLeft);
};

MapController.prototype.getMap = function(){
    return this.map;
}

// Implementación petición HTTP usando Promises
// Usamos la librería Bluebird, para promisificar 
// métodos asíncronos
MapController.prototype.request = function(method, url){
    return new Bluebird(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status < 400) resolve(JSON.parse(xhr.responseText));
            else if(xhr.readyState === 4) reject(xhr.responseText)
        };
        xhr.send(null);
    });
}

MapController.prototype.parsers = {
    'geojson' : new ol.format.GeoJSON()
}

// Función para añadir una capa recibida del server
// como GeoJSON a un grupo de capas
MapController.prototype.addLayer = function(capa, group){
    var self = this;
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
            features : this.parsers['geojson'].readFeatures(capa.layer)
        })
    });

    // Le damos un listener a la capa, para cuando cambie su
    // visibilidad
    vector.on('change:visible', function(e){
        // La capa ha sido forzada a que no se visulize
        if(self.layerVisibilityChanged){
            // cambiamos el estado de la variable a false
            self.layerVisibilityChanged = false;
            // Si el número de veces que se ha disparado este evento coincide con 
            // el tamaño de la lista de capasQueTeniaVisibles mostramos un mensaje informativo
            // de que no puedes visualizar las capas a un zoom tan bajo
            if (self.countLayersVisibilityChanged >= self.capasQueTeniaVisibles.length && self.capasQueTeniaVisibles.length){
                // Modificamos la variable @countLayersVisibilityChanged a 0
                self.countLayersVisibilityChanged = 0;
            }
            // No seguimos
            return;
        }

        // La capa no ha sido forzada a que no se visualice
        // ha sido el usuario dándole click al checkbox del LayerSwitcher
        // Si el zoom es menor que @MIN_ZOOM_SHOW_LAYERS
        if(this.getVisible && self.map.getView().getZoom() < self.MIN_ZOOM_SHOW_LAYERS){
            // Ponemos @layerVisibilityChanged a true para decir que hemos forzado
            // a ocultar la capa
            self.layerVisibilityChanged = true;
            // La ocultamos
            this.setVisible(false);
            // Decimos que a este zoom no se puede mostrar la capa
            Materialize.toast('Zoom demasiado bajo para ver la capa', 1000);
        }
    }); // Fin vector.on(...)
    
    // Añadimos la capa a la lista de capas
    self.layers.push(vector);
    // Añadimos la capa al grupo
    group.getLayers().extend([vector]);

    // Movemos ciertas capas arriba del todo 
    // estas capas son las que se usan en las herramientas de
    // perfil y medición (No se mostrarán en el LayerSwitcher)
    self.map.getLayers().forEach(function(l, i){
        if(l.get('name') == 'Perfil LineStringZ' || l.get('name') == 'vector medir' 
            || l.get('name') == 'features selected' || l.get('name') == 'position' 
        ){
            self.map.getLayers().getArray().splice(i, 1);
            self.map.getLayers().getArray().push(l);
        }
    });
} // Fin addCapa()

MapController.prototype.loadMaps = function(){
    /* Obtenemos los mapas del usuario 
    listOfMaps contendrá una lista con un objeto
    {
        id : (id_mapa), 
        mapName : (Nombre del mapa), 
        maplayerIds : [(lista con ids de las capas que conforman el mapa)]
    }
    */
    var self = this;
    this.request('GET', '/usuarios/mapas')
    .then(function(listOfMaps){
        // Recorremos la lista de mapas con reduce
        console.log(listOfMaps, 'lisst');
        return Bluebird.all(
            listOfMaps.map(function(mapa){
                // Creamos un grupo de capas
                // que contendrá todas las capas del mapa
                console.log('mapa'. mapa);
                var groupCapasMap = new ol.layer.Group({
                    name: mapa.mapName,
                    format : new ol.format.GeoJSON(),
                    visible : true
                });
                // Añadimos el grupo al mapa
                self.map.addLayer(groupCapasMap);
                // Utilizamos Promise.all para obtener todas las capas del mapa
                return Bluebird.all(
                    // Recorremos la lista de ids de las capas con map
                    mapa.maplayerIds.map(function(mlId){
                        // mlId es la id de una de las capas del mapa
                        // Enviamos una petición para obtener la capa en 
                        // formato GeoJSON
                        return self.request('GET', '/usuarios/capas/' + mlId)
                        .then(function(capa){
                            // Obtenemos la capa en formato GeoJSON
                            // Llamamos a la función addCapa()
                            self.addLayer(capa, groupCapasMap);
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
                .then(function(){
                    // Mostramos mensaje mapa cargado
                    Materialize.toast('Mapa cargado : ' + mapa.mapName, 2500);
                })
            })
        );
    }) // XHRPromise(...).then(...)
    .then(function(){
        // Cuando cambia el Zoom del mapa
        self.map.getView().on('change:resolution', function(){
            // Si el zoom es menor que @MIN_ZOOM_SHOW_LAYERS
            if(self.map.getView().getZoom() < self.MIN_ZOOM_SHOW_LAYERS){
                // Recorremos nuestras capas editables
                self.layers.forEach(function(c, i){
                    // Si alguna está visible
                    if (c.getVisible()){
                        // Añadimos esa capa a la lista @capasQueTeniaVisibles
                        self.capasQueTeniaVisibles.push(c);
                        // actualizamos el contador de capas forzadas a ocultarse
                        self.countLayersVisibilityChanged++;
                        // Función para que se ejecute en el siguiente
                        // tick del event-loop
                        var func = function(){
                            // Ponemos a true la variable layerVisibilityChanged
                            self.layerVisibilityChanged = true;
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
                self.capasQueTeniaVisibles.forEach(function(c){
                    // Ponemos a visible dichas capas
                    c.setVisible(true);
                });
                // Modificamos la variable @capasQueTeniaVisibles
                // a una lista vacía
                //console.log('Modificar capasQueTeniaVisibles a []');
                self.capasQueTeniaVisibles = [];
            }
        });
    })
    .catch(function(err){
        // Ha habido un error
        Materialize.toast('Error cargando los mapas : ', 2500);
        console.log(err);
        //alert(err);
    });
}

var mapController = new MapController();
mapController.loadMaps();

$('body').resize(function(){
    console.log('fullscreen');
})