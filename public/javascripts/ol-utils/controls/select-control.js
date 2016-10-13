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

function getTable(obj){
    //console.log('props', Object.keys(obj));
    var str_ = '<div class="col s12" style="overflow-x : scroll;"><table><thead>' + 
        Object.keys(obj).reduce(function(str, k){
            if(k != 'geometry' && k != 'layerName')
                str += '<th>' + k + '</th>'
            return str;
        }, '') + 
    '</thead><tbody></tbody></table></div>';
    //console.log(str_, $(str_));
    return $(str_);
}

var modalSelect = new ModalBetera('#modal-feature', {
    complete : function(){
        mapController.updateSize('bottom', '0px');
    }
});

var modalSelectDisp = modalSelect.getDisparador()

function SelectControl(mapController){

    var map = mapController.map;
    var mainbar = mapController.mainbar;

    var listener;

    // Control en la barra principal
    var controlSelect = new ol.control.Toggle({
        name : 'select',
        html: '<i class="material-icons">info_outline</i>',
        onToggle : function(){
            mapController.sourceSelectedFeatures.clear();
            map.getTargetElement().style.cursor = 'auto';
            map.unByKey(listener);

            modalSelect.closeModal();
            mapController.updateSize('bottom', '0px');

            if(!this.getActive()) return;

            mainbar.getControls().forEach(function(control){
                if(control.name !== 'select' && control.name){
                    console.log('control', control.name);
                    control.setActive(false);
                    control.onToggle.call(control);
                }
            });

            if (!mapController.mobileAndTabletcheck()){
                listener = map.on('pointermove', handleSelect.bind(mapController));
            } else {
                listener = map.on('click', handleSelectClick.bind(mapController));
            }
        },
        tooltip : {
            text : 'Seleccionar Features',
            delay : 50,
            position : 'bottom'
        }
    });
    mainbar.addControl(controlSelect);
}

// Función para disp. móviles
function handleSelectClick(e){
    var hayFeatures = false;
    var self = this;

    this.sourceSelectedFeatures.clear();
    this.layers.forEach(function(c){
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
                    self.sourceSelectedFeatures.addFeature(feature);
                    self.map.getTargetElement().style.cursor = 'pointer';
                }
                //console.log(c.get('name'), distance);
            }
            // Calcular la distancia
        }
        else if(features.length){
            hayFeatures = true;
            //console.log(c.get('name'), features);
            self.map.getTargetElement().style.cursor = 'pointer';
            features.forEach(function(f){
                f.set('layerName', c.get('name'));
                self.sourceSelectedFeatures.addFeature(f);
            })
        }
    });

    //alert('handle' + hayFeatures + self.sourceSelectedFeatures.getFeatures().length);

    if(!hayFeatures) return;
    showTable(self);
}

/******* 
 * SELECT HOVERRRR
 * 
 * 
 * 
 */
// Listener click mapa para seleccionar features hover
var listenerClick;
// función que se ejecita al hacer hover
function handleSelect(e){
    var self = this;
    // Eliminamos todas las features de la capa
    this.sourceSelectedFeatures.clear();
    // Creamos el listener map.once()
    createListenerClick(self);
    // boolean que indica si se seleccionan feats o no
    var hayFeatures = false;
    this.layers.forEach(function(c){
        var source = c.getSource();
        var features = source.getFeaturesAtCoordinate(e.coordinate);
        //console.log(c.get('geomColumnType'));
        // Solo hacemos esto para líneas y puntos, ya que la interaction.Select de OL-3
        // no los selecciona "bien"
        if(!features.length && (c.get('geomColumnType') === 'LineString' || c.get('geomColumnType') === 'Point') ){
            // Obtenemos la feature más cercana al punto clicado
            var feature = source.getClosestFeatureToCoordinate(e.coordinate);
            // Si hay feature
            if(feature){
                var ext = feature.getGeometry().getExtent();
                var cc = ol.extent.getCenter(ext);
                // Calculamos la distancia al punto clicado
                var distance = c.get('geomColumnType') === 'Point' 
                    ? distancePointPoint(e.coordinate, cc)
                    : distancePointPoint(feature.getGeometry().getClosestPoint(e.coordinate), e.coordinate);

                if(distance < 0.5) {
                    hayFeatures = true;
                    feature.set('layerName', c.get('name'));
                    self.sourceSelectedFeatures.addFeature(feature);
                    self.map.getTargetElement().style.cursor = 'pointer';
                }
                //console.log(c.get('name'), distance);
            }
            // Calcular la distancia
        }
        else if(features.length){
            hayFeatures = true;
            //console.log(c.get('name'), features);
            self.map.getTargetElement().style.cursor = 'pointer';
            features.forEach(function(f){
                f.set('layerName', c.get('name'));
                self.sourceSelectedFeatures.addFeature(f);
            })
        }
    });

    this.sourceSelectedFeatures.changed();

    if(!hayFeatures) {
        this.map.un(listenerClick);
        this.map.getTargetElement().style.cursor = 'auto';
        //sourceSelectedFeatures.clear();
    }
    //alert(hayFeatures);
}

function createListenerClick(self){
    var listenerClick = self.map.once('click', function(){
        if(!self.sourceSelectedFeatures.getFeatures().length) return;
        showTable(self);
    });
}

function distancePointPoint(clicked, dest){
    return ol.sphere.WGS84.haversineDistance(
        ol.proj.transform(clicked, 'EPSG:25830', 'EPSG:4326'),
        ol.proj.transform(dest, 'EPSG:25830', 'EPSG:4326') 
    );
}

function showTable(self){
    $('#modal-feature .modal-content').empty();
    self.sourceSelectedFeatures.forEachFeature(function(f){
        var props = f.getProperties();
        var layerName = f.get('layerName');
        var table = getTable(props);
        $('#modal-feature .modal-content')
        .append('<div class="card-panel col s12" style="background : rgba(48,63,159, 0.3); padding : 10px; width : 100%; color : #fff;">' + layerName + '</div>')
        .append('<div style="height : 5px;"></div>')
        //.append(getTableHeader(props))
        .append(table)
        .append('<tr style="height : 5px;"></tr>');
        table.find('tbody').append(
            getTableRow(props)
            .hover(function(){
                this.style.cursor = 'pointer';
                this.style.background = 'rgba(48,63,120, 0.3)';
                this.style.color = '#fff';
                self.sourceSelectedFeatures.clear();
                self.sourceSelectedFeatures.addFeature(f);
            }, function(){
                this.style.color = '#000';
                this.style.background = '#fff';
                self.sourceSelectedFeatures.clear();
            })
            .click(function(){
                var extent = f.getGeometry().getExtent();
                self.map.getView().fit(extent, self.map.getSize());
            })
        )
    });

    modalSelectDisp.trigger('click');
    $('.lean-overlay').remove();
    //self.updateSize('bottom', $('#modal-feature').innerHeight());
}