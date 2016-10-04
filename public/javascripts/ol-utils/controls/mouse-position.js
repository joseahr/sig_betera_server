ol.control.MousePositionBetera = function(opts){

    this.displaying = true;

    var this_ = this;

    var element = document.createElement('div');
        element.className = 'coords-scale-container collection card-panel row';
        element.style.padding = '0px';
        element.style.position = 'absolute';
        element.style.right = '0.5em';
        element.style.bottom = '0.5em';
        element.style.height = 'auto';
        element.style['max-width'] = '150px';
        element.style.margin = '0px';
        element.style.visibility = 'hidden';
        element.style.background = 'rgba(0,0,0,0)';
        element.style.border = 'none';

    var closeElementContainer = $('<div>').appendTo(element);
        closeElementContainer.get(0).className = 'col s12 valign-wrapper';
        closeElementContainer.get(0).style.background = 'rgba(0,0,0,0)';
        closeElementContainer.get(0).style.padding = '0px';

    var closeElement = $('<a>').appendTo(closeElementContainer);
        closeElement.get(0).href = '#';
        closeElement.get(0).className = 'material-icons red-text valign';
        closeElement.html('clear');

    var coordsContainer = $('<div>').appendTo(element);
        coordsContainer.get(0).style.clear = 'both';
        coordsContainer.get(0).className = 'coords-container';
        coordsContainer.get(0).style.background = 'rgba(0,0,0,0)';

    var label25830 = $('<div>').appendTo(coordsContainer);
        label25830.get(0).className = 'collection-item flow-text center-align indigo darken-2 white-text font-size-1';
        label25830.get(0).style.padding = '0.15em';
        label25830.html('ETRS89 UTM H30');

    var coords25830 = $('<div id="coords25830">').appendTo(coordsContainer);
        coords25830.get(0).className = 'collection-item';
        coords25830.get(0).style.padding = '0.15em';
        coords25830.get(0).style['min-height'] = '25px';

    var label4258 = $('<div>').appendTo(coordsContainer);
        label4258.get(0).className = 'collection-item flow-text center-align indigo darken-2 white-text font-size-1';
        label4258.get(0).style.padding = '0.15em';
        label4258.html('ETRS89 Geográficas');

    var coords4258 = $('<div id="coords4258">').appendTo(coordsContainer);
        coords4258.get(0).className = 'collection-item';
        coords4258.get(0).style.padding = '0.15em';
        coords4258.get(0).style['min-height'] = '25px';

    // Control de Posición del ratón (Muestra las coords en EPSG:25830)
    var mousePositionControl25830 = new ol.control.MousePosition({
        coordinateFormat : ol.coordinate.createStringXY(3),
        target : coords25830.get(0),
        className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
        projection : opts.mapController.projections['25830']
    });
    opts.mapController.map.addControl(mousePositionControl25830);

    // Control de Posición del ratón (Muestra las coords en EPSG:4258)
    var mousePositionControl4258 = new ol.control.MousePosition({
        coordinateFormat : ol.coordinate.toStringHDMS,
        target : coords4258.get(0),
        className  : 'ol-mouse-position-custom flow-text center-align font-size-1 padding-1',
        projection : opts.mapController.projections['4258']
    });
    opts.mapController.map.addControl(mousePositionControl4258);

    //console.log(this.mousePositionVisible);
    // Función que se ejecuta cuando estamos encima del mapa
    this.onHover = function (){
        $('.coords-scale-container').css('visibility', 'visible');
    }

    // Función que se ejecuta cuando salimos del mapa
    this.onHoverOut = function(){
        $('.coords-scale-container').css('visibility', 'hidden');
    }

    // Ocultamos/Mostramos los controles de MousePosition
    // al hacer hover sobre el mapa
    $('#map').on('mouseenter', this.onHover);
    $('#map').on('mouseleave', this.onHoverOut);
    opts.mapController.map.once('pointermove', this.onHover);
    this.mousePositionVisible = true;

    closeElement.on('click', function(e){
        e.preventDefault();
        if(this_.displaying){
            $('#map').off('mouseenter');
            $('#map').off('mouseleave');
            $('.coords-container').css('display', 'none');

            closeElement
                .removeClass('red-text')
                .addClass('indigo-text')
                .css('font-size', '3em')
                .html('list');

        } else {
            $('#map').on('mouseenter', this_.onHover);
            $('#map').on('mouseleave', this_.onHoverOut);
            $('.coords-container').css('display', '');

            closeElement
            .addClass('red-text')
            .removeClass('indigo-text')
            .css('font-size', '24px')
            .html('clear');

        }
        this_.displaying = !this_.displaying;
    });

    ol.control.Control.call(this, {
        element : element
    });
}
ol.inherits(ol.control.MousePositionBetera, ol.control.Control);