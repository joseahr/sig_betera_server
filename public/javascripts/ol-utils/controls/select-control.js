function SelectControl(mapController){

    var map = mapController.map;
    var mainbar = mapController.mainbar;

    var listener;

    // Control en la barra principal
    var controlSelect = new ol.control.Toggle({
        name : 'select',
        html: '<i class="material-icons">pan_tool</i>',
        onToggle : function(){
            mapController.sourceSelectedFeatures.clear();
            map.getTargetElement().style.cursor = 'auto';
            map.unByKey(listener);

            $('#modal-feature').closeModal();
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

    $('#modal-feature table').empty();
    this.sourceSelectedFeatures.forEachFeature(function(f){
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
        .append('<tr style="height : 5px;"></tr>');
    });
    $('<a href="#modal-feature">').leanModal({
        complete : function(){
            self.updateSize('bottom', '0px');
        }
    }).trigger('click');
    $('.lean-overlay').remove();
    self.updateSize('bottom', $('#modal-feature').innerHeight());
}

function handleSelect(e){
    var self = this;

    this.sourceSelectedFeatures.clear();

    var listenerClick = this.map.once('click', function(){
        if(!self.sourceSelectedFeatures.getFeatures().length) return;
        $('#modal-feature table').empty();
        self.sourceSelectedFeatures.forEachFeature(function(f){
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
            .append('<tr style="height : 5px;"></tr>');
        });

        $('<a href="#modal-feature">').leanModal({
            complete : function(){
                self.updateSize('bottom', '0px');
            }
        }).trigger('click');
        $('.lean-overlay').remove();
        self.updateSize('bottom', $('#modal-feature').innerHeight());
    });

    var hayFeatures = false;
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

    this.sourceSelectedFeatures.changed();

    if(!hayFeatures) {
        this.map.un(listenerClick);
        this.map.getTargetElement().style.cursor = 'auto';
        //sourceSelectedFeatures.clear();
    }
    //alert(hayFeatures);
}