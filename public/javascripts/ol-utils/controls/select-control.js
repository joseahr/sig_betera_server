function getTableRow(obj){
    var tr = $('<tr>');
    Object.keys(obj).map(function(k){
        if(k == 'geometry' || k == 'layerName') return;
        if(k === 'data_urls' && obj[k]){
            obj[k].reduce(function(td, el){
                $('<a>').addClass('truncate').attr('target', '_blank').attr('href', el.url).html( el.url.split('/').pop() ).appendTo(td);
                td.append('<br>');
                return td;
            }, $('<td>') ).appendTo(tr);
        } 
        else $('<td>').html(obj[k]).appendTo(tr); 
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
        },
        tooltip : {
            text : 'Seleccionar Features',
            delay : 50,
            position : 'bottom'
        }
    });

    var featuresSelectSubBar = new ol.control.Bar();

    var sourcePointControlSelect = new ol.source.Vector();
    var featuresPerPointControl = new ol.control.Toggle({
        name : 'select',
        html : '<i class="material-icons">place</i>',
        tooltip : {
            text : 'Por Punto',
            delay : 50,
            position : 'bottom'
        },
        interaction : new ol.interaction.Draw({
            source : sourcePointControlSelect,
            type : 'Point'
        }),
        onToggle : function(){
            if(this.getActive()){
                $(this.element).find('i').css('color', 'rgba(60, 136, 0, 0.7)')}
            else
                $(this.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');
            
            if(!this.getActive()) return;

            featuresPerAreaControl.setActive(false);
            featuresPerAreaControl.onToggle.call(featuresPerAreaControl);
            featuresPerBBOXControl.setActive(false);
            featuresPerBBOXControl.onToggle.call(featuresPerBBOXControl);
        }
    });
    featuresPerPointControl.getInteraction().on('drawend', function(e){
        var feature = e.feature;
        sourcePointControlSelect.clear();
        var pointGeoJSON = mapController.parsers['wkt'].writeFeature(feature);
        handleGetInfo(pointGeoJSON);
    });
    featuresSelectSubBar.addControl(featuresPerPointControl);


    var sourcePolygonControlSelect = new ol.source.Vector();
    var featuresPerAreaControl = new ol.control.Toggle({
        name : 'select',
        html : '<i class="material-icons">bookmark</i>',
        tooltip : {
            text : 'Por Area',
            delay : 50,
            position : 'bottom'
        },
        interaction : new ol.interaction.Draw({
            source : sourcePolygonControlSelect,
            type : 'Polygon'
        }),
        onToggle : function(){
            if(this.getActive()){
                $(this.element).find('i').css('color', 'rgba(60, 136, 0, 0.7)')}
            else
                $(this.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');
            
            if(!this.getActive()) return;

            featuresPerPointControl.setActive(false);
            featuresPerPointControl.onToggle.call(featuresPerPointControl);
            featuresPerBBOXControl.setActive(false);
            featuresPerBBOXControl.onToggle.call(featuresPerBBOXControl);
        }
    });
    featuresPerAreaControl.getInteraction().on('drawend', function(e){
        var feature = e.feature;
        sourcePolygonControlSelect.clear();
        var pointGeoJSON = mapController.parsers['wkt'].writeFeature(feature);
        handleGetInfo(pointGeoJSON);
    });
    featuresSelectSubBar.addControl(featuresPerAreaControl);

    var featuresPerBBOXControl = new ol.control.Toggle({
        name : 'select',
        html : '<i class="material-icons">crop_square</i>',
        tooltip : {
            text : 'Por BBOX',
            delay : 50,
            position : 'bottom'
        },
        interaction : new ol.interaction.DragBox({

        }),
        onToggle : function(){
            if(this.getActive()){
                $(this.element).find('i').css('color', 'rgba(60, 136, 0, 0.7)')}
            else
                $(this.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');
            
            if(!this.getActive()) return;

            featuresPerPointControl.setActive(false);
            featuresPerPointControl.onToggle.call(featuresPerPointControl);
            featuresPerAreaControl.setActive(false);
            featuresPerAreaControl.onToggle.call(featuresPerAreaControl);
        }
    });
    featuresPerBBOXControl.getInteraction().on('boxend', function(e){
        var feature = new ol.Feature({ geometry : featuresPerBBOXControl.getInteraction().getGeometry() });
        sourcePolygonControlSelect.clear();
        var pointGeoJSON = mapController.parsers['wkt'].writeFeature(feature);
        handleGetInfo(pointGeoJSON);
    });
    featuresSelectSubBar.addControl(featuresPerBBOXControl);


    mainbar.addControl(controlSelect, featuresSelectSubBar);

}

function handleGetInfo(wkt){
    console.log(wkt);

    var selectedLayers = [];
    mapController.map.getLayers().forEach(function(l){
        console.log(l);
        if(l.getVisible() && l.get('layers') && l.get('mapa'))
            l.getLayers().forEach(function(ll){
                console.log(ll.getSource().getUrls(), ll instanceof ol.layer.Tile, ll.getUrl, ll.geUrls );
                if(ll.getVisible() && ll.getSource().getUrls()[0] == 'http://www.sig.betera.es:8080/geoserver/betera/wms') selectedLayers.push(ll.get('name'));
            })
    });
    console.log(selectedLayers);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/usuarios/capas/byGeom', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            //console.log(xhr.responseText);
            if(xhr.status >= 200 && xhr.status < 400){
                console.log(JSON.parse(xhr.responseText));
                showTable(JSON.parse(xhr.responseText), mapController);
                Materialize.toast('Consulta realizada satisfactoriamente.', 2000);
            }
        }
    }
    xhr.send($.param([
        { name : 'wkt', value : wkt },
        { name : 'layers', value : selectedLayers }
    ]));

}

function showTable(objs, self){
    $('#modal-feature .modal-content').empty();

    objs.forEach(function(obj){
        if(!obj.found.features) return;
        var layerName = obj.layername;
        var props_ = obj.found.features[0].properties;
        var table = getTable(props_);
        console.log(obj);

        $('#modal-feature .modal-content')
        .append('<div class="card-panel col s12" style="background : rgba(48,63,159, 0.3); padding : 10px; width : 100%; color : #fff;">' + layerName + '</div>')
        .append('<div style="height : 5px;"></div>')
        //.append(getTableHeader(props))
        .append(table)
        .append('<tr style="height : 5px;"></tr>');

        obj.found.features.forEach(function(f){
            var props = f.properties;

            table.find('tbody').append(
                getTableRow(props)
                .hover(function(){
                    this.style.cursor = 'pointer';
                    this.style.background = 'rgba(48,63,120, 0.3)';
                    this.style.color = '#fff';
                    //self.sourceSelectedFeatures.clear();
                    //self.sourceSelectedFeatures.addFeature(f);
                }, function(){
                    this.style.color = '#000';
                    this.style.background = '#fff';
                    //self.sourceSelectedFeatures.clear();
                })
                .click(function(){
                    var geom;
                    console.log(f.geometry.coordinates);
                    switch(f.geometry.type.toLowerCase()){
                        case 'linestring' :
                        case 'multilinestring':
                            geom = new ol.geom.LineString(f.geometry.coordinates[0]);break;
                        case 'pollygon' :
                        case 'multipolygon':
                            geom = new ol.geom.Polygon(f.geometry.coordinates[0]);break;
                        default :
                            geom = new ol.geom.Point(f.geometry.coordinates);break;
                    }
                    var extent = new ol.Feature({
                        geometry : geom
                    }).getGeometry().getExtent();
                    self.map.getView().fit(extent, self.map.getSize());
                    var center = ol.extent.getCenter(extent);
                    pulseFeature(center);
                })
            )
        });
    });

    modalSelectDisp.trigger('click');
    $('.lean-overlay').remove();
    //self.updateSize('bottom', $('#modal-feature').innerHeight());
}

function pulseFeature(coord)
{	
    if(!this.count) this.count = 0;

    var map = mapController.map;
    var f = new ol.Feature (new ol.geom.Point(coord));
    f.setStyle (new ol.style.Style(
                {	image: new ol.style['Circle'] (
                    {	radius: 20, 
                        points: 4,
                        stroke: new ol.style.Stroke ({ color: '#ffbb00', width:3 })
                    })
                }));
    map.animateFeature (f, new ol.featureAnimation.Zoom(
        {	fade: ol.easing.easeOut, 
            duration:3000, 
            easing: ol.easing['upAndDown'] 
        }));
    this.count ++;
    if(count < 4) setTimeout(pulseFeature.bind(this, coord), Math.random() * 300 );
    else this.count = 0;
}