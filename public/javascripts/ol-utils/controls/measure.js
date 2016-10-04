function MeasureControl(mapController){    
    var mainbar = mapController.mainbar;
    var map = mapController.getMap();

    var vectorMeasure = new ol.layer.Vector({
        name : 'vector medir',
        displayInLayerSwitcher : false,
        source : new ol.source.Vector()
    });
    map.addLayer(vectorMeasure);

    var measureBar = new ol.control.Toggle({
        name : 'medir',	
        html: '<i class="material-icons" style="font-size : 20px;">border_color</i>',
        tooltip : {
            text : 'Medir',
            delay : 50,
            position : 'left'
        },
        onToggle : function(){

            measureSubBar.getControls().forEach(function(c){
                $(c.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');
                c.setActive(false);
            });

            vectorMeasure.getSource().clear();
            measureBar.setInteraction(null);

            map.removeOverlay(measureTooltip);
            map.removeOverlay(helpTooltip);
            map.removeOverlay(lastTooltip);

            if(!this.getActive()) return;
            /*if(isEditingMode()) {
                this.setActive(false);
                this.onToggle.call(this);
                Materialize.toast('No puede usar este control cuando está editando una capa', 2500);
                return;
            }*/

            mainbar.getControls().forEach(function(control){
                if(control.name !== 'medir' && control.name){
                    console.log('control', control.name);
                    control.setActive(false);
                    control.onToggle.call(control);
                }
            });

        }
    });

    var measureSubBar = new ol.control.Bar();

    var controlLineMeasure = new ol.control.Toggle({
        name : 'medir longitud',
        html: '<i class="material-icons">timeline</i>',
        tooltip : {
            text : 'Longitud',
            delay : 50,
            position : 'left'
        },
        className: "",
        onToggle: function(){
            if(this.getActive()){
                $(this.element).find('i').css('color', 'rgba(60, 136, 0, 0.7)')}
            else
                $(this.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');

            desactivar();
            
            if(!this.getActive()) return;

            controlPolygonMeasure.setActive(false);
            controlPolygonMeasure.onToggle.call(controlPolygonMeasure);

            var it = new ol.interaction.Draw({
                source : vectorMeasure.getSource(),
                type : 'LineString',
            });
            it.on('drawstart', drawStart);
            it.on('drawend', drawEnd);

            map.addInteraction(it);
            measureBar.setInteraction(it);

            createHelpTooltip();
            createMeasureTooltip();
        }
    });

    var controlPolygonMeasure = new ol.control.Toggle({	
        html: '<i class="material-icons">bookmark</i>',
        tooltip : {
            text : 'Área',
            delay : 50,
            position : 'bottom'
        },
        className: "",
        onToggle: function() {
            if(this.getActive())
                $(this.element).find('i').css('color', 'rgba(60, 136, 0, 0.7)')
            else
                $(this.element).find('i').css('color', 'rgba(0, 60, 136, 0.5)');
            
            desactivar();
            
            if(!this.getActive()) return;

            controlLineMeasure.setActive(false);
            controlLineMeasure.onToggle.call(controlLineMeasure);

            var it = new ol.interaction.Draw({
                source : vectorMeasure.getSource(),
                type : 'Polygon',
            });
            it.on('drawstart', drawStart);
            it.on('drawend', drawEnd);

            map.addInteraction(it);
            measureBar.setInteraction(it);

            createHelpTooltip();
            createMeasureTooltip();
        }
    });

    var undoLastPointMeasureControl = new ol.control.Toggle({	
        html: '<i class="material-icons">backspace</i>',
        className: "noToggle",
        tooltip : {
            text : 'Eliminar último punto',
            delay : 50,
            position : 'bottom'
        },
        onToggle: function(){
            if(measureBar.getInteraction()){
                try {
                    measureBar.getInteraction().removeLastPoint();
                    vectorMeasure.getSource().changed();               
                } catch (e) {
                }
            }
        }
    });
    var finishDrawingMeasureControl = new ol.control.Toggle({	
        html: '<i class="material-icons">done</i>',
        className: "noToggle",
        tooltip : {
            text : 'Finalizar',
            delay : 50,
            position : 'right'
        },
        onToggle: function(){
            if(measureBar.getInteraction() && sketch ){
                measureBar.getInteraction().finishDrawing();
                var feature = vectorMeasure.getSource().getFeatures()[0];
                var geom = feature.getGeometry();
                if(geom instanceof ol.geom.LineString && !geom.getLength()){
                    map.removeOverlay(measureTooltip);
                    map.removeOverlay(lastTooltip);
                    sketch = null;
                    createMeasureTooltip();
                    vectorMeasure.getSource().clear();
                    return Materialize.toast('Dibuje un elemento lineal a medir', 2500);
                }
                if(geom instanceof ol.geom.Polygon && !geom.getArea()){
                    map.removeOverlay(measureTooltip);
                    map.removeOverlay(lastTooltip);
                    sketch = null;
                    createMeasureTooltip();
                    vectorMeasure.getSource().clear();
                    return Materialize.toast('Dibuje un elemento poligonal a medir', 2500);
                }
            } else {
                Materialize.toast('Dibuje un elemento a medir', 2500);
            }
        }
    });

    measureSubBar.addControl (controlLineMeasure);
    measureSubBar.addControl (controlPolygonMeasure);
    measureSubBar.addControl(undoLastPointMeasureControl);
    measureSubBar.addControl(finishDrawingMeasureControl);

    mainbar.addControl(measureBar, measureSubBar);

    var grs80 = new ol.Sphere(6378137);
    var lastTooltip;
    var sketch; // Feature que se está dibujando
    var helpTooltipElement; // Elemento HTML (mensaje de ayuda)
    var helpTooltip; // Overlay para ver el mensaje de ayuda
    var measureTooltipElement; // Elemento HTML (mensaje de medición)
    var measureTooltip; // Overlay para ver el mensaje de medición
    var listener;
    var continuePolygonMsg = 'Click para continuar dibujado el polígono'; // Mensaje que se muestra cuando un usuario dibuja un polígono
    var continueLineMsg = 'Click para continuar dibujado la línea'; // Mensaje que se muestra cuando un usuario dibuja una línea

    function desactivar(){
        helpTooltipElement = null;
        measureTooltipElement = null;
        sketch = null;
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);

        map.removeInteraction(measureBar.getInteraction());
        measureBar.setInteraction(null);
    }

    function formatLength(line) {
        var coordinates = line.getCoordinates();
        var length = 0;
        var sourceProj = map.getView().getProjection();
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += grs80.haversineDistance(c1, c2);
        }
        return length > 1000 
            ? (Math.round(length / 1000 * 100) / 100) + ' km'
            : (Math.round(length * 100) / 100) + ' m';
    }

    function formatArea(polygon) {
        var sourceProj = map.getView().getProjection();
        var geom = (polygon.clone().transform(sourceProj, 'EPSG:4326'));
        var coordinates = geom.getLinearRing(0).getCoordinates();
        var area = Math.abs(grs80.geodesicArea(coordinates));
        
        return area > 10000
            ? (Math.round(area / 1000000 * 100) / 100) + ' km<sup>2</sup>'
            : (Math.round(area * 100) / 100) + ' m<sup>2</sup>';
    }

    function createMeasureTooltip(){
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'chip tooltip indigo-text darken-2 tooltip-measure';
        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltip);
    }

    function createHelpTooltip(){
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'chip tooltip hidden hide-on-med-and-slow';
        helpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(helpTooltip);
    }

    function pointerMoveHandler(evt) { // Función que se ejecuta cada vez que nos movemos por el mapa
        if (evt.dragging || !measureBar.getInteraction()) {
            return;
        }
        var helpMsg = 'Click para empezar a dibujar';

        if (sketch) {
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }

        helpTooltipElement.innerHTML = helpMsg;
        helpTooltip.setPosition(evt.coordinate);

        $(helpTooltipElement).removeClass('hidden');
    }

    function drawStart (evt){
        vectorMeasure.getSource().clear();
        if (lastTooltip)
            map.removeOverlay(lastTooltip);

        sketch = evt.feature;
            
        var tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength( /** @type {ol.geom.LineString} */ (geom));
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
            
    }; // drawstart

    function drawEnd(){

        map.removeOverlay(helpTooltip);
        measureTooltipElement.className = 'chip indigo-text darken-2 tooltip-static tooltip-measure';
        measureTooltip.setOffset([0, -7]);
        lastTooltip = measureTooltip;

        measureTooltipElement = null;
        sketch = null;

        createMeasureTooltip();
        createHelpTooltip();
    }

    map.on('pointermove', pointerMoveHandler);
}